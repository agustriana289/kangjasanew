import { Metadata } from "next";
import UndianClient from "./UndianClient";

export const metadata: Metadata = {
  title: "Undian | Dashboard",
};

export default function UndianPage() {
  return <UndianClient />;
}
