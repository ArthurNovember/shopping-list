import React from "react";
import {
  AAShopIcon,
  AlbertIcon,
  BauhausIcon,
  DmIcon,
  FialaIcon,
  GenericStoreIcon,
  IkeaIcon,
  JyskIcon,
  LekarnaIcon,
  LidlIcon,
  PennyIcon,
  PepcoIcon,
  StoreIconProps,
  SusiceIcon,
  TetaIcon,
} from "./StoreIcons";

function normalize(name: string) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

const MATCHERS: {
  test: (n: string) => boolean;
  Icon: React.ComponentType<StoreIconProps>;
}[] = [
  { test: (n) => n.includes("a&a") || n.includes("a & a") || n.includes("aa shop"), Icon: AAShopIcon },
  { test: (n) => n.includes("albert"), Icon: AlbertIcon },
  { test: (n) => n.includes("bauhaus"), Icon: BauhausIcon },
  { test: (n) => n.includes("fiala"), Icon: FialaIcon },
  { test: (n) => n.includes("ikea"), Icon: IkeaIcon },
  { test: (n) => n.includes("jysk"), Icon: JyskIcon },
  { test: (n) => n.includes("lidl"), Icon: LidlIcon },
  { test: (n) => n.includes("penny"), Icon: PennyIcon },
  { test: (n) => n.includes("pepco"), Icon: PepcoIcon },
  { test: (n) => n.includes("teta"), Icon: TetaIcon },
  { test: (n) => n.includes("lekarna"), Icon: LekarnaIcon },
  { test: (n) => n.includes("susice"), Icon: SusiceIcon },
  { test: (n) => n === "dm" || n.startsWith("dm ") || n.includes(" dm") || n.includes("drogerie dm"), Icon: DmIcon },
];

export function getStoreIconComponent(name: string): React.ComponentType<StoreIconProps> {
  const n = normalize(name);
  const match = MATCHERS.find((m) => m.test(n));
  return match ? match.Icon : GenericStoreIcon;
}

export function StoreIcon({
  name,
  size = 20,
  mono = false,
  color = "#666",
}: {
  name: string;
  size?: number;
  mono?: boolean;
  color?: string;
}) {
  const Icon = getStoreIconComponent(name);
  return <Icon size={size} mono={mono} color={color} />;
}
