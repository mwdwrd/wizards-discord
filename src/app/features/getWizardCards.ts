import { Contract } from "ethers";
import ABI from "@data/abis/Card.json";
import WizardCards from "@data/WizardCards.json";
import getJsonRpcProvider from "./getJsonRpcProvider";

export const getCardIds = async (address: string): Promise<number[]> => {
  const cardIds = [];
  const contract = new Contract("0x329Fd5E0d9aAd262b13CA07C87d001bec716ED39", ABI, getJsonRpcProvider());
  let balance = await contract.functions.balanceOf(address);

  for (let index = 0; index < balance; index++) {
    const cardId = await contract.functions.tokenOfOwnerByIndex(address, index);
    cardIds.push(Number(cardId));
  }

  return cardIds;
};

export const getWizardCards = async (address: string): Promise<any> => {
  const wizardCards: any = [];
  const cardIds = await getCardIds(address);
  cardIds.map((cardId) => {
    const result = WizardCards.filter((card) => card === cardId);
    if (result[0]) wizardCards.push(result[0]);
  });
  return wizardCards;
};

export default getWizardCards;

// query GetAdventureCardPacks {
//   adventureCardPacks(where: { numericId: cardIds }) {
//     id
//     numericId
//     owner
//     name
//   }
// }
