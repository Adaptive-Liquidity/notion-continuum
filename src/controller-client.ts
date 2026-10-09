import http from 'node:http';
export function callController(
  socket: string,
  capability: string,
  operation: string,
  route = '/dispatch',
  extra?: Record<string, unknown>,
): Promise<{ state: string; id: string; version: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath: socket,
        path: route,
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + capability,
          'content-type': 'application/json',
        },
      },
      (res) => {
        let t = '';
        res.on('data', (x) => (t += x));
        res.on('end', () =>
          res.statusCode === 200 ? resolve(JSON.parse(t)) : reject(Error(t)),
        );
      },
    );
    req.on('error', reject);
    req.end(JSON.stringify({ operation, ...extra }));
  });
}
