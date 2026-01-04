import {
  BadgeDollarSign,
  BookOpen,
  Bus,
  Coffee,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartHandshake,
  Home,
  ShoppingBag,
  Sparkles,
  Tag,
  Utensils,
  Wallet,
} from "lucide-react";

export const CATEGORY_ICON_MAP = {
  Utensils,
  Home,
  Bus,
  BookOpen,
  Coffee,
  Gamepad2,
  Sparkles,
  Wallet,
  BadgeDollarSign,
  GraduationCap,
  Gift,
  HeartHandshake,
  ShoppingBag,
};

export const CATEGORY_ICON_OPTIONS = [
  { value: "Utensils", label: "Makan" },
  { value: "Home", label: "Kos" },
  { value: "Bus", label: "Transport" },
  { value: "BookOpen", label: "Kuliah" },
  { value: "Coffee", label: "Nongkrong" },
  { value: "ShoppingBag", label: "Belanja" },
  { value: "Gamepad2", label: "Hiburan" },
  { value: "Wallet", label: "Uang Saku" },
  { value: "BadgeDollarSign", label: "Gaji" },
  { value: "GraduationCap", label: "Beasiswa" },
  { value: "Gift", label: "Hadiah" },
  { value: "HeartHandshake", label: "Sosial" },
  { value: "Sparkles", label: "Lainnya" },
];

export const getCategoryIcon = (iconName) => {
  return CATEGORY_ICON_MAP[iconName] || Tag;
};
