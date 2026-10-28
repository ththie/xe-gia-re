export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();
    const token = data.access_token;

    if (!token) {
      return res.status(400).send("Failed to get access token from GitHub.");
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head><title>Auth Success</title></head>
      <body>
        <script>
          const receiveMessage = (message) => {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
              message.origin
            );
            window.removeEventListener('message', receiveMessage, false);
          };
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send("Internal Server Error: " + error.message);
  }
}
