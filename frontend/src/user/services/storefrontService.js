import { catalogService } from "./catalogService";
import { wishlistService } from "./wishlistService";
import { cartService } from "./cartService";
import { ordersService } from "./ordersService";
import { contentService } from "./contentService";
import { addressService } from "./addressService";

export const storefrontService = {
  ...catalogService,
  ...wishlistService,
  ...cartService,
  ...ordersService,
  ...contentService,
  ...addressService,
};
