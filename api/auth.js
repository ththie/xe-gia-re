export default async function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`);
}
