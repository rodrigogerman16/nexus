import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteList } from "@/components/notes/NoteList";
import type { Note } from "@/lib/store/types";

function makeNote(overrides: Partial<Note> & { id: string }): Note {
  return {
    title: "Note",
    content: "Content",
    tags: [],
    pinned: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("NoteList empty states", () => {
  it("shows the 'no notes yet' state with a create CTA when there are no notes and no search", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(
      <NoteList
        notes={[]}
        onSelect={vi.fn()}
        onCreate={onCreate}
        search=""
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /create note/i }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("shows a 'no results' message instead of the create CTA when a search yields nothing", () => {
    render(
      <NoteList
        notes={[]}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        search="zzz-nonexistent"
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText(/No notes match/)).toBeInTheDocument();
    expect(screen.getByText(/zzz-nonexistent/)).toBeInTheDocument();
    expect(screen.queryByText(/No notes yet/)).not.toBeInTheDocument();
  });

  it("renders notes instead of an empty state when notes are present", () => {
    render(
      <NoteList
        notes={[makeNote({ id: "n1", title: "My First Note" })]}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText("My First Note")).toBeInTheDocument();
    expect(screen.queryByText(/No notes yet/)).not.toBeInTheDocument();
  });
});
