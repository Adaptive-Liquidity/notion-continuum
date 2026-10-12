"""Launcher tests use temporary files and fake services; no fixture server is modified."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("launcher", Path(__file__).with_name("local-test.py"))
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


class LocalLauncherTests(unittest.TestCase):
    def test_live_settings_rejected_without_exposing_value(self):
        for key in launcher.LIVE:
            with self.assertRaises(ValueError) as caught:
                launcher.validate_environment({key: "SECRET_VALUE"})
            self.assertNotIn("SECRET_VALUE", str(caught.exception))

    def test_conflicting_profiles_refused(self):
        for env in ({"NODE_ENV": "production"}, {"PGPORT": "5432"},
                    {"PGHOST": "remote"}, {"CT_RUNTIME_ENV": "staging"},
                    {"CT_CONSOLE_MODE": "PRODUCT"}, {"PGUSER": "postgres"}):
            with self.assertRaises(ValueError):
                launcher.validate_environment(env)
        launcher.validate_environment({})

    def test_profile_is_data_not_commands(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "profile.json"
            profile = {key: "/runtime/example" for key in launcher.KEYS}
            path.write_text(json.dumps(profile))
            self.assertEqual(launcher.load_profile(path), profile)
            profile["command"] = "install something"
            path.write_text(json.dumps(profile))
            with self.assertRaises(ValueError):
                launcher.load_profile(path)

    def test_foreign_database_and_symlink_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".local").mkdir()
            expected = root / ".local" / "pgdata"
            launcher.require_owned_database(str(expected), root)
            with self.assertRaises(ValueError):
                launcher.require_owned_database("/other/task/pgdata", root)
            expected.symlink_to(root, target_is_directory=True)
            with self.assertRaises(ValueError):
                launcher.require_owned_database(str(root), root)

    def test_two_processes_cannot_hold_lease(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "lease"
            with launcher.Lease(path):
                code = "import fcntl,sys; f=open(sys.argv[1], 'r+'); fcntl.flock(f, fcntl.LOCK_EX|fcntl.LOCK_NB)"
                result = subprocess.run([sys.executable, "-c", code, str(path)],
                                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                self.assertNotEqual(result.returncode, 0)
            with launcher.Lease(path):
                pass

    def test_lease_released_after_interruption(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "lease"
            with self.assertRaises(KeyboardInterrupt):
                with launcher.Lease(path):
                    raise KeyboardInterrupt
            with launcher.Lease(path):
                pass

    def test_linked_lease_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "target"
            target.write_text("unchanged")
            path = Path(directory) / "lease"
            path.symlink_to(target)
            with self.assertRaises(OSError):
                with launcher.Lease(path):
                    pass
            self.assertEqual(target.read_text(), "unchanged")

    def test_wrong_runtime_rejected(self):
        profile = {key: "/runtime/example" for key in launcher.KEYS}
        with patch.dict(os.environ, {}, clear=True), patch.object(Path, "is_file", return_value=True), \
                patch.object(os, "access", return_value=True), \
                patch.object(launcher, "output", return_value="v22.23.3"):
            with self.assertRaisesRegex(ValueError, "Runtime differs"):
                launcher.preflight(profile)

    def test_interruption_terminates_only_created_process_group(self):
        with patch.object(launcher.subprocess, "Popen") as popen, patch.object(os, "killpg") as kill:
            child = popen.return_value
            child.pid = 24680
            child.wait.side_effect = [KeyboardInterrupt, 0]
            child.poll.return_value = None
            with self.assertRaises(KeyboardInterrupt):
                launcher.run_child(["fake"], {}, None)
            kill.assert_called_once_with(24680, launcher.signal.SIGTERM)
            self.assertTrue(popen.call_args.kwargs["start_new_session"])

    def test_failed_test_retains_evidence_and_exit_code(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.object(launcher, "ROOT", root), patch.object(launcher, "Lease"), \
                    patch.object(launcher, "preflight", return_value=({}, {"backend": "test"})), \
                    patch.object(launcher, "database_query", return_value="0"), \
                    patch.object(launcher, "source_identity", return_value={"sourceDigest": "same"}), \
                    patch.object(launcher, "output", return_value="head"), \
                    patch.object(launcher, "run_child", return_value=7):
                self.assertEqual(launcher.execute("focused", ["event-envelope.test.js"], {}), 7)
            record = json.loads(next(root.glob(".artifacts/local-launcher/*/result.json")).read_text())
            self.assertEqual(record["status"], "FAIL")
            self.assertEqual(record["exitCode"], 7)

    def test_check_mode_does_not_acquire_lease_or_run_tests(self):
        with patch.object(sys, "argv", ["local-test.py", "check", "--profile", "private.json"]), \
                patch.object(launcher, "load_profile", return_value={}), \
                patch.object(launcher, "preflight", return_value=({}, {})), \
                patch.object(launcher, "Lease") as lease, patch.object(launcher, "execute") as execute:
            self.assertEqual(launcher.main(), 0)
            lease.assert_not_called()
            execute.assert_not_called()

    def test_documented_focused_argument_order(self):
        with patch.object(sys, "argv", ["local-test.py", "focused", "--profile", "private.json", "event-envelope.test.js"]), \
                patch.object(launcher, "load_profile", return_value={}), \
                patch.object(launcher, "execute", return_value=0) as execute:
            self.assertEqual(launcher.main(), 0)
            execute.assert_called_once_with("focused", ["event-envelope.test.js"], {})

    def test_source_change_and_interruption_never_report_pass(self):
        for interrupt in (False, True):
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                with patch.object(launcher, "ROOT", root), patch.object(launcher, "Lease"), \
                        patch.object(launcher, "preflight", return_value=({}, {})), \
                        patch.object(launcher, "database_query", return_value="0"), \
                        patch.object(launcher, "source_identity", side_effect=[{"sourceDigest": "before"}, {"sourceDigest": "after"}]), \
                        patch.object(launcher, "output", return_value="head"), \
                        patch.object(launcher, "run_child", side_effect=KeyboardInterrupt if interrupt else None, return_value=0):
                    if interrupt:
                        with self.assertRaises(KeyboardInterrupt):
                            launcher.execute("focused", ["example.test.js"], {})
                    else:
                        self.assertEqual(launcher.execute("focused", ["example.test.js"], {}), 2)
                record = json.loads(next(root.glob(".artifacts/local-launcher/*/result.json")).read_text())
                self.assertEqual(record["status"], "INCOMPLETE" if interrupt else "SOURCE_CHANGED")
                self.assertEqual(record["exitCode"], 130 if interrupt else 2)


if __name__ == "__main__":
    unittest.main()
