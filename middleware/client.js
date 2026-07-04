const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getClientId = (req) => {
  const raw = req.headers["x-client-id"];
  if (!raw || typeof raw !== "string") return null;
  const id = raw.trim();
  return UUID_RE.test(id) ? id : null;
};

const requireClientId = (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    res.status(400).json({ message: "Client identifier is required." });
    return null;
  }
  return clientId;
};

const sessionBelongsToClient = (session, clientId) =>
  Boolean(session?.client_id && session.client_id === clientId);

module.exports = {
  getClientId,
  requireClientId,
  sessionBelongsToClient,
};
