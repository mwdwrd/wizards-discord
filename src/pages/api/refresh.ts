import getWizardCards from "@app/features/getWizardCards";
import prisma from "@server/helpers/prisma";
import { addRoleForUser, AdminRoleID, getRolesForUser, removeFromServer, WizardRoleID } from "@server/services/Discord";
import dayjs from "dayjs";
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
    const wizardCards = await getWizardCards(user.address.toLowerCase());
    console.log(`${user.username} ${user.address} has ${wizardCards.length} wizards: (${wizardCards.map((cardId: number) => cardId).join(", ")})`);

    if (wizardCards.length === 0) {
      console.log("Kicking User", user.username);
      await prisma.user.update({
        where: { id: user.id },
        data: { lastChecked: new Date(), inServer: false, wizards: [] },
      });
      try {
        console.log(`Removing ${user.username} from server`);
        await removeFromServer(user.discordId as string);
      } catch (err) {
        console.log(err);
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastChecked: new Date(),
          inServer: true,
          wizards: wizardCards.map((cardId: number) => cardId.toString()),
        },
      });

      if (user.discordId && user.inServer) {
        const { roles: userRoleIds }: { roles: string[] } = await getRolesForUser(user.discordId);
        const isAdmin = userRoleIds.filter((roleId) => roleId === AdminRoleID);
        const isWizard = userRoleIds.filter((roleId) => roleId === WizardRoleID);

        if (isAdmin) continue;
        if (!isWizard) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          console.log(`Adding Wizard Role`, WizardRoleID, user.discordId, user.address.toLowerCase());
          await addRoleForUser(WizardRoleID as string, user.discordId);
        }
      }
    }
  }

  return res.json({ success: true });
};

export default api;
