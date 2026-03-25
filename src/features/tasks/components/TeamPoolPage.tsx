import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/convex/_generated/api";
import { TaskList } from "./TaskList";
import type { Id } from "~/convex/_generated/dataModel";

export function TeamPoolPage() {
  const { data: tasks = [] } = useQuery(
    convexQuery(api.tasks.queries.teamPool, {}),
  );
  const { data: currentUser } = useQuery(
    convexQuery(api.users.queries.getCurrentUser, {}),
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-primary">Team Pool</h1>
        <p className="text-sm text-primary/60">Unassigned tasks available for the team.</p>
      </div>

      <TaskList
        tasks={tasks}
        emptyMessage="No tasks in the pool."
        showGrab
        currentUserId={currentUser?._id as Id<"users"> | undefined}
      />
    </div>
  );
}
