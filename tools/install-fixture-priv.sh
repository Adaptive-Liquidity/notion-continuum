#!/bin/bash
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Install the fixture privilege helper as root.'; exit 2; }
[ -n "${CT_FIXTURE_NODE:-}" ] || { echo 'Set CT_FIXTURE_NODE to the absolute Node 24 binary.'; exit 2; }
[ -x "$CT_FIXTURE_NODE" ] || { echo 'CT_FIXTURE_NODE is not executable.'; exit 2; }
root=$(cd "$(dirname "$0")/.." && pwd)
fixtures=${CT_FIXTURE_ROOT:-$root/.local/computer-fixtures}
case "$CT_FIXTURE_NODE" in /*) ;; *) echo 'CT_FIXTURE_NODE must be absolute.'; exit 2 ;; esac
case "$fixtures" in /*) ;; *) echo 'Fixture root must be absolute.'; exit 2 ;; esac
install -o root -g root -m 0755 "$root/tools/continuum-fixture-priv.py" /usr/local/sbin/continuum-fixture-priv
umask 022
printf 'node=%s\nfixtures=%s\n' "$CT_FIXTURE_NODE" "$fixtures" > /etc/continuum-fixture-priv.conf
chown root:root /etc/continuum-fixture-priv.conf
chmod 0644 /etc/continuum-fixture-priv.conf
if [ -n "${CT_FIXTURE_SUDO_USER:-}" ]; then
  printf '%s ALL=(root) NOPASSWD: /usr/local/sbin/continuum-fixture-priv\n' "$CT_FIXTURE_SUDO_USER" > /etc/sudoers.d/continuum-local-fixture
  chmod 0440 /etc/sudoers.d/continuum-local-fixture
  visudo -cf /etc/sudoers.d/continuum-local-fixture
fi
echo 'Fixture privilege helper installed.'
