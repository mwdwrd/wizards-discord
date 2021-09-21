export const getProfile = async (
  accessToken: string
): Promise<{
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
}> => {
  const { user } = await fetch("https://discord.com/api/oauth2/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
  return user;
};

export const getAccessToken = async (code: string) => {
  const body = {
    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    redirect_uri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
    grant_type: "authorization_code",
    scope: "identify guilds.join",
    code,
  };
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "post",
    body: Object.keys(body)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent((body as any)[key]))
      .join("&"),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  }).then((res) => res.json());
  return (response?.access_token as string) || null;
};

export const getLoginURL = (state: string) =>
  `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string}&redirect_uri=${encodeURIComponent(
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
  )}&response_type=code&scope=identify%20guilds.join&state=${state}`;

export const addToServer = async (userID: string, accessToken: string) => {
  const body = {
    access_token: accessToken,
  };
  await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID as string}/members/${userID}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status == 201) return res.json();
    else return res.text();
  });
};

export const removeFromServer = async (userID: string) => {
  await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID as string}/members/${userID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status == 201) return res.json();
    else return res.text();
  });
};

export const getRolesForUser = async (userId: string) => {
  return await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID}/members/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export const setRolesForUser = async (roles: string[], userID: string) => {
  await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID}/members/${userID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roles }),
  }).then((res) => res.json());
};
export const addRoleForUser = async (roleId: string, userID: string) => {
  await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID}/members/${userID}/roles/${roleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.text());
};
export const removeRoleForUser = async (roleId: string, userID: string) => {
  await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_SERVER_ID}/members/${userID}/roles/${roleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.text());
};

export const RolesToIDs: Record<string, string> = {
  "Ancient Helm": "884485814816497694",
  "Ancient Helm of Detection": "884485995872002098",
  "Ancient Helm of Enlightenment": "884486634169598032",
  "Ancient Helm of Skill": "884486697079955536",
  "Ancient Helm of Giants": "884486734354731008",
  "Ancient Helm of Brilliance": "884486771012956211",
  "Ancient Helm of Anger": "884486809986404373",
  "Ancient Helm of the Fox": "884486920707665930",
  "Ancient Helm of Reflection": "884487484443074581",
  "Ancient Helm of Titans": "884487527539568761",
  "Ancient Helm of Power": "884487569503563846",
  "Ancient Helm of Vitriol": "884487605528436837",
  "Ancient Helm of Protection": "884487645944750090",
  "Ancient Helm of Perfection": "884487689229975552",
  "Ancient Helm of the Twins": "884487730782949377",
  "Ancient Helm of Fury": "884487980935446638",
  "Ancient Helm of Rage": "884488031275462656",
};

// Guardian of the Realm
export const AdminRoleID = "882448562758246451";

// Builder
export const BuilderRoleID = "884143420266938481";

// Ancient
export const flexRoleID = "881897843198132255";
