/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
import { client } from "../../";
import { address, url, apiToken } from "./config";
import { createViewModel } from "./viewModels/addressAsset";
import { formatCurrency } from "./viewModels/shared/formatCurrency";
import { formatNumber } from "./viewModels/shared/formatNumber";

client.configure({
  url,
  apiToken,
});

const currency = "usd";

client.addressAssets({
  payload: {
    address,
    currency,
  },
  onData: data => {
    const assetsToDisplay = Object.values(data.assets)
      .map(addressAsset => createViewModel(addressAsset))
      .filter(asset => asset.value != null && asset.value > 1)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map(asset => ({
        ...asset,
        price: formatCurrency(asset.price, currency),
        value: formatNumber(asset.value),
      }));

    console.table(assetsToDisplay); // eslint-disable-line no-console
  },
});
