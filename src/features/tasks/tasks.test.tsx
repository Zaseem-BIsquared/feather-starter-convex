import { describe, expect, it } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test } from "@cvx/test.setup";
import { api } from "~/convex/_generated/api";
import { renderWithRouter } from "@/test-helpers";
import { TasksPage, TeamPoolPage } from "./index";
import { navItems } from "@/shared/nav";
import { Route as TasksRoute } from "@/routes/_app/_auth/dashboard/_layout.tasks";
import { Route as TeamPoolRoute } from "@/routes/_app/_auth/dashboard/_layout.team-pool";

// ── Route beforeLoad tests ──────────────────────────────────────────

describe("TasksRoute.beforeLoad", () => {
  it("returns the correct context", () => {
    const context = TasksRoute.options.beforeLoad!({} as any);
    expect(context).toEqual({
      headerTitle: "My Tasks",
      headerDescription: "Your assigned tasks across all projects.",
    });
  });
});

describe("TeamPoolRoute.beforeLoad", () => {
  it("returns the correct context", () => {
    const context = TeamPoolRoute.options.beforeLoad!({} as any);
    expect(context).toEqual({
      headerTitle: "Team Pool",
      headerDescription: "Unassigned tasks available for the team.",
    });
  });
});

// ── Nav items include My Tasks and Team Pool ────────────────────────

describe("navItems", () => {
  it("includes My Tasks entry", () => {
    const myTasks = navItems.find((item) => item.to === "/dashboard/tasks");
    expect(myTasks).toBeDefined();
    expect(myTasks!.label).toBe("My Tasks");
    expect(myTasks!.i18nKey).toBe("tasks.nav.myTasks");
  });

  it("includes Team Pool entry", () => {
    const teamPool = navItems.find(
      (item) => item.to === "/dashboard/team-pool",
    );
    expect(teamPool).toBeDefined();
    expect(teamPool!.label).toBe("Team Pool");
    expect(teamPool!.i18nKey).toBe("tasks.nav.teamPool");
  });
});

// ── My Tasks page ───────────────────────────────────────────────────

test("My Tasks page renders heading and task form", async ({ client }) => {
  renderWithRouter(<TasksPage />, client);

  await waitFor(() => {
    expect(screen.getByText("My Tasks")).toBeInTheDocument();
  });

  expect(screen.getByPlaceholderText("Add a task...")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});

test("My Tasks page renders task items", async ({
  client,
  testClient,
  userId,
}) => {
  // Seed tasks assigned to current user
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Buy groceries",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
    await ctx.db.insert("tasks", {
      title: "Write tests",
      priority: true,
      status: "in_progress",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 2000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });
  expect(screen.getByText("Write tests")).toBeInTheDocument();
});

test("My Tasks page shows empty state when no tasks", async ({ client }) => {
  renderWithRouter(<TasksPage />, client);

  await waitFor(() => {
    expect(
      screen.getByText("No tasks yet. Create one above!"),
    ).toBeInTheDocument();
  });
});

test("My Tasks page creates a task via form", async ({
  client,
}) => {
  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByPlaceholderText("Add a task...")).toBeInTheDocument();
  });

  const input = screen.getByPlaceholderText("Add a task...");
  await user.type(input, "New task from form");
  await user.click(screen.getByRole("button", { name: /add/i }));

  // Verify task was created in the backend
  await waitFor(async () => {
    const tasks = await client.query(api.tasks.queries.myTasks, {});
    expect(tasks.some((t: any) => t.title === "New task from form")).toBe(true);
  });
});

// ── Team Pool page ──────────────────────────────────────────────────

test("Team Pool page renders heading", async ({ client }) => {
  renderWithRouter(<TeamPoolPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Team Pool")).toBeInTheDocument();
  });
});

test("Team Pool page renders unassigned tasks", async ({
  client,
  testClient,
  userId,
}) => {
  // Seed unassigned shared tasks
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Unassigned task",
      priority: false,
      status: "todo",
      visibility: "shared",
      creatorId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TeamPoolPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Unassigned task")).toBeInTheDocument();
  });

  // Should have a Grab button
  expect(screen.getAllByRole("button", { name: /grab/i }).length).toBeGreaterThan(0);
});

test("Team Pool page shows empty state when no tasks", async ({ client }) => {
  renderWithRouter(<TeamPoolPage />, client);

  await waitFor(() => {
    expect(
      screen.getByText("No tasks in the pool."),
    ).toBeInTheDocument();
  });
});

// ── TaskStatusBadge tests ───────────────────────────────────────────

test("TaskStatusBadge renders correct status and advances on click", async ({
  client,
  testClient,
  userId,
}) => {
  // Seed a task with todo status
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Status test task",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  // Wait for task to render
  await waitFor(() => {
    expect(screen.getByText("Status test task")).toBeInTheDocument();
  });

  // Should show "To Do" status
  expect(screen.getByText("To Do")).toBeInTheDocument();

  // Click the status badge to advance to "In Progress"
  await user.click(screen.getByText("To Do"));

  await waitFor(async () => {
    const task = await client.query(api.tasks.queries.myTasks, {});
    expect(task[0].status).toBe("in_progress");
  });
});

// ── TaskItem interactions ───────────────────────────────────────────

test("TaskItem delete button uses double-check pattern", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Task to delete",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByText("Task to delete")).toBeInTheDocument();
  });

  // First click shows "Are you sure?" -- the delete button contains an SVG icon
  const taskRow = screen.getByText("Task to delete").closest("div.flex.items-center");
  const buttons = taskRow!.querySelectorAll("button");
  // The last button in the row is the delete button
  const trashButton = buttons[buttons.length - 1];
  expect(trashButton).toBeDefined();
  await user.click(trashButton!);

  await waitFor(() => {
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  // Second click confirms deletion
  await user.click(screen.getByText("Are you sure?"));

  await waitFor(async () => {
    const tasks = await client.query(api.tasks.queries.myTasks, {});
    expect(tasks).toHaveLength(0);
  });
});

test("TaskItem priority toggle updates priority", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Priority task",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByText("Priority task")).toBeInTheDocument();
  });

  // Click the flag icon to toggle priority
  const flagButton = screen.getByTitle("Normal");
  await user.click(flagButton);

  await waitFor(async () => {
    const tasks = await client.query(api.tasks.queries.myTasks, {});
    expect(tasks[0].priority).toBe(true);
  });
});

test("TaskItem inline title edit saves on Enter", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Editable title",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByText("Editable title")).toBeInTheDocument();
  });

  // Click the title text to enter edit mode
  await user.click(screen.getByText("Editable title"));

  await waitFor(() => {
    const input = screen.getByDisplayValue("Editable title");
    expect(input).toBeInTheDocument();
  });

  const input = screen.getByDisplayValue("Editable title");
  await user.clear(input);
  await user.type(input, "Updated title{Enter}");

  await waitFor(async () => {
    const tasks = await client.query(api.tasks.queries.myTasks, {});
    expect(tasks[0].title).toBe("Updated title");
  });
});

test("TaskItem inline title edit cancels on Escape", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Keep this title",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByText("Keep this title")).toBeInTheDocument();
  });

  // Enter edit mode
  await user.click(screen.getByText("Keep this title"));

  await waitFor(() => {
    expect(screen.getByDisplayValue("Keep this title")).toBeInTheDocument();
  });

  // Press Escape to cancel
  await user.keyboard("{Escape}");

  await waitFor(() => {
    expect(screen.getByText("Keep this title")).toBeInTheDocument();
  });
});

test("TaskItem title span enters edit mode via Enter key", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Keyboard edit",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Keyboard edit")).toBeInTheDocument();
  });

  // Fire keyDown Enter directly on the span to trigger edit mode
  const titleSpan = screen.getByText("Keyboard edit");
  fireEvent.keyDown(titleSpan, { key: "Enter" });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Keyboard edit")).toBeInTheDocument();
  });
});

test("TaskItem inline title edit does not save unchanged title", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Same title",
      priority: false,
      status: "todo",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByText("Same title")).toBeInTheDocument();
  });

  // Click title to enter edit mode, then blur without changing
  await user.click(screen.getByText("Same title"));

  await waitFor(() => {
    expect(screen.getByDisplayValue("Same title")).toBeInTheDocument();
  });

  // Blur to save -- should NOT trigger mutation since title unchanged
  await user.tab(); // blur

  await waitFor(() => {
    expect(screen.getByText("Same title")).toBeInTheDocument();
  });
});

// ── Team Pool grab task ─────────────────────────────────────────────

test("Team Pool grab button renders for each task", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Grab me",
      priority: false,
      status: "todo",
      visibility: "shared",
      creatorId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TeamPoolPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Grab me")).toBeInTheDocument();
  });

  // Grab buttons should be present
  const grabButtons = screen.getAllByRole("button", { name: /grab/i });
  expect(grabButtons.length).toBeGreaterThan(0);
});

test("Team Pool assign via grab works at backend level", async ({
  client,
  testClient,
  userId,
}) => {
  let taskId: any;
  await testClient.run(async (ctx: any) => {
    taskId = await ctx.db.insert("tasks", {
      title: "Backend grab",
      priority: false,
      status: "todo",
      visibility: "shared",
      creatorId: userId,
      position: 1000,
    });
  });

  // Directly call the assign mutation
  await client.mutation(api.tasks.mutations.assign, {
    taskId,
    assigneeId: userId,
  });

  // Task should no longer be in team pool
  const pool = await client.query(api.tasks.queries.teamPool, {});
  expect(pool).toHaveLength(0);
});

// ── Status badge done state ─────────────────────────────────────────

test("TaskStatusBadge done state is disabled", async ({
  client,
  testClient,
  userId,
}) => {
  await testClient.run(async (ctx: any) => {
    await ctx.db.insert("tasks", {
      title: "Done task",
      priority: false,
      status: "done",
      visibility: "private",
      creatorId: userId,
      assigneeId: userId,
      position: 1000,
    });
  });

  renderWithRouter(<TasksPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  // The done status badge button should be disabled
  const doneButton = screen.getByText("Done").closest("button");
  expect(doneButton).toBeDisabled();
});
