import { getActiveServices } from "@/lib/db/services";
import { getSettings } from "@/lib/db/settings";
import { BellevueSite } from "@/components/bellevue-site";

export default async function Home() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getSettings(),
  ]);

  return <BellevueSite services={services} settings={settings} />;
}
