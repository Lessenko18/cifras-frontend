import { describe, expect, it } from "vitest";
import { getPlaylistOwnerId, getPlaylistPermissions, isPlaylistSharedWith } from "../playlistAccess";

const me = { _id: "u1", email: "Eu@Exemplo.com" };

describe("getPlaylistOwnerId", () => {
  it("lê o dono como id, objeto ou outros apelidos de campo", () => {
    expect(getPlaylistOwnerId({ criador: "u1" })).toBe("u1");
    expect(getPlaylistOwnerId({ criador: { _id: "u2" } })).toBe("u2");
    expect(getPlaylistOwnerId({ createdBy: { id: "u3" } })).toBe("u3");
    expect(getPlaylistOwnerId({})).toBeNull();
  });
});

describe("isPlaylistSharedWith", () => {
  it("reconhece por e-mail (sem diferenciar maiúsculas) ou por id", () => {
    expect(isPlaylistSharedWith({ sharedWith: ["eu@exemplo.com"] }, me)).toBe(true);
    expect(isPlaylistSharedWith({ sharedWith: [{ _id: "u1" }] }, me)).toBe(true);
    expect(isPlaylistSharedWith({ sharedWith: [{ email: "outro@x.com" }] }, me)).toBe(false);
    expect(isPlaylistSharedWith({ sharedWith: [] }, me)).toBe(false);
    expect(isPlaylistSharedWith({}, me)).toBe(false);
  });
});

describe("getPlaylistPermissions", () => {
  it("dono compartilha, edita e exclui", () => {
    expect(getPlaylistPermissions({ criador: "u1" }, me)).toMatchObject({
      canShare: true,
      canEdit: true,
      canDelete: true,
    });
  });

  it("quem recebeu a playlist só edita", () => {
    expect(getPlaylistPermissions({ criador: "u2", sharedWith: ["eu@exemplo.com"] }, me)).toMatchObject({
      canShare: false,
      canEdit: true,
      canDelete: false,
    });
  });

  it("estranho não faz nada, mas ADM faz tudo (menos ser 'compartilhado')", () => {
    expect(getPlaylistPermissions({ criador: "u2" }, me)).toMatchObject({
      canShare: false,
      canEdit: false,
      canDelete: false,
    });
    expect(getPlaylistPermissions({ criador: "u2" }, me, true)).toMatchObject({
      canShare: true,
      canEdit: true,
      canDelete: true,
    });
  });

  it("sem dono identificável, assume que é do usuário (a menos que compartilhada)", () => {
    expect(getPlaylistPermissions({}, me).canDelete).toBe(true);
    expect(getPlaylistPermissions({ sharedWith: ["eu@exemplo.com"] }, me).canDelete).toBe(false);
  });
});
