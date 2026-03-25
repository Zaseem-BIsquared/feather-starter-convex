import { useForm } from "@tanstack/react-form";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "~/convex/_generated/api";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { TASK_TITLE_MAX_LENGTH } from "@/shared/schemas/tasks";

export function TaskForm() {
  const { mutateAsync: createTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.mutations.create),
  });

  const form = useForm({
    defaultValues: { title: "" },
    onSubmit: async ({ value }) => {
      await createTask({ title: value.title.trim() });
      form.reset();
    },
  });

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="title"
        children={(field) => (
          <Input
            placeholder="Add a task..."
            autoComplete="off"
            required
            maxLength={TASK_TITLE_MAX_LENGTH}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className="flex-1 bg-transparent"
          />
        )}
      />
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}
