export default async function handler(req, res) {
  const code = req.query.code;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });
  const data = await response.json();
  const token = data.access_token;

  const content = `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
          message.origin
        );
        window.removeEventListener('message', receiveMessage, false);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    </script>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(content);
}
