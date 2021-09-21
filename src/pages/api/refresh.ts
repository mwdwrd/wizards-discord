import prisma from "@server/helpers/prisma";
import { addRoleForUser, AdminRoleID, BuilderRoleID, flexRoleID, getRolesForUser, removeRoleForUser, RolesToIDs } from "@server/services/Discord";
import dayjs from "dayjs";
import { getBagsInWallet } from "loot-sdk";
import { NextApiHandler } from "next";

const api: NextApiHandler = async (_req, res) => {
  const usersToRefresh = await prisma.user.findMany({
    where: {
      discordId: { not: null },
      inServer: true,
      lastChecked: { lt: dayjs().subtract(2, "minute").toDate() },
    },
    orderBy: {
      lastChecked: "asc",
    },
  });
  for (const user of usersToRefresh) {
    const bags = await getBagsInWallet(user.address.toLowerCase());
    const filteredBags = bags.filter((bag) => bag.head.toLowerCase().includes("wizard"));
    console.log(`${user.username} ${user.address} has ${filteredBags.length} wizards: (${filteredBags.map((bag) => bag.head).join(", ")})`);

    // Do not kick users that have not entered through this gate.
    // if (filteredBags.length == 0) {
    //   console.log('Should kick', user.username);
    //   await prisma.user.update({
    //     where: { id: user.id },
    //     data: { lastChecked: new Date(), inServer: false, wizards: [] }
    //   });
    //   try {
    //     console.log(`Removing ${user.username} from server`);
    //     await removeFromServer(user.discordId as string);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastChecked: new Date(),
        inServer: true,
        wizards: filteredBags.map((bag) => bag.head),
      },
    });
    if (user.discordId && user.inServer) {
      const newRoleIds = filteredBags.map((bag) => bag.head).map((name) => RolesToIDs[name]);
      const { roles: existingRoleIds }: { roles: string[] } = await getRolesForUser(user.discordId);
      const toRemove = existingRoleIds?.filter((x) => !newRoleIds?.includes(x)) || [];
      const toAdd = newRoleIds?.filter((x) => !existingRoleIds?.includes(x)) || [];
      for (const roleId of toRemove) {
        if (roleId == AdminRoleID || roleId == BuilderRoleID || roleId == flexRoleID) continue;
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("Removing role for user", roleId, user.discordId);
        await removeRoleForUser(roleId, user.discordId);
      }
      for (const roleId of toAdd) {
        if (roleId == AdminRoleID) continue;
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("Adding role for user", roleId, user.discordId);
        await addRoleForUser(roleId, user.discordId);
      }
    }
  }
  return res.json({ success: true });
};

export default api;
