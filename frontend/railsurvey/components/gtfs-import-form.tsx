"use client";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { importGtfs } from "@/functions/importGtfs";

type FormData = {
  zipFile: File | null;
};

export default function ImportForm() {
  const form = useForm<FormData>({
    defaultValues: {
      zipFile: null,
    },
  });

  async function onSubmit(values: FormData) {
    console.log(values);
    if (values.zipFile) {
      await importGtfs(values.zipFile);
    }
  }

  return (
    <div>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="zipFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GTFS zip file</FormLabel>
                  <FormControl>
                    <Input
                      id="zipFile"
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        field.onChange(e.target.files?.[0] || null); // Update the form state with the selected file
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <Button type="submit">Submit file</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
