export const api = {
  getGroups: async () => {
    // In this simple app, we'll just fetch from local storage for group IDs 
    // or we could have an endpoint to list all (not ideal for privacy).
    // For now, let's assume we store "myGroups" in localStorage.
    const groupIds = JSON.parse(localStorage.getItem("squadsplit_groups") || "[]");
    const groups = await Promise.all(groupIds.map(async (id: string) => {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) return res.json();
      return null;
    }));
    return groups.filter(Boolean);
  },

  getGroup: async (id: string) => {
    const res = await fetch(`/api/groups/${id}`);
    if (!res.ok) throw new Error("Group not found");
    return res.json();
  },

  createGroup: async (data: { name: string; description: string; createdBy: string; members: string[] }) => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    
    // Save to local storage for persistence across sessions (since no formal auth)
    const existing = JSON.parse(localStorage.getItem("squadsplit_groups") || "[]");
    localStorage.setItem("squadsplit_groups", JSON.stringify([...existing, result.id]));
    
    return result;
  },

  addExpense: async (data: { groupId: string; description: string; amount: number; payer: string; splitBetween: string[] }) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getBalances: async (groupId: string) => {
    const res = await fetch(`/api/groups/${groupId}/balances`);
    return res.json();
  }
};
