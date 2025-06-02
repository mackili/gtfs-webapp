import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactElement } from "react";
import ImportForm from "@/components/gtfs-import-form";

type SettingPickerType = {
  title: string;
  key: string;
  content: string | ReactElement | JSX.Element;
};

const settingsPicker: SettingPickerType[] = [
  {
    title: "Import GTFS",
    key: "importGtfs",
    content: <ImportForm />,
  },
  { title: "Manage GTFS-RT", key: "magageRT", content: "x" },
];

export default function Settings() {
  return (
    <div className="w-full m-8 flex">
      <Tabs defaultValue="importGtfs">
        <TabsList>
          {settingsPicker.map((tab) => (
            <TabsTrigger
              className="cursor-pointer"
              value={tab.key}
              key={tab.key}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {settingsPicker.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
