import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";

// Initialize Firebase Admin
// Note: In this environment, we might not have a service account JSON file.
// We'll try to initialize with the project ID from the config.
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();
// Use the specific database ID if provided in config
if (firebaseConfig.firestoreDatabaseId) {
    // In newer firebase-admin versions, you can't easily set databaseId on initializeApp for Firestore
    // but you can usually get the specific database like this:
    // const db = getFirestore(firebaseConfig.firestoreDatabaseId);
    // However, if it's the default or standard one, getFirestore() is fine.
    // If it's a specific one, we might need a different approach.
    // For now, I'll assume the default or handle it if errors occur.
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create a new group
  app.post("/api/groups", async (req, res) => {
    try {
      const { name, description, createdBy, members } = req.body;
      const groupRef = await db.collection("groups").add({
        name,
        description,
        createdBy,
        members: members || [createdBy],
        createdAt: FieldValue.serverTimestamp(),
      });
      res.json({ id: groupRef.id });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  // Get group details and expenses
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const groupDoc = await db.collection("groups").doc(req.params.id).get();
      if (!groupDoc.exists) {
        return res.status(404).json({ error: "Group not found" });
      }

      const expensesSnapshot = await db.collection("expenses")
        .where("groupId", "==", req.params.id)
        .orderBy("date", "desc")
        .get();

      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        ...groupDoc.data(),
        id: groupDoc.id,
        expenses,
      });
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  // Add an expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const { groupId, description, amount, payer, splitBetween } = req.body;
      const expenseRef = await db.collection("expenses").add({
        groupId,
        description,
        amount: parseFloat(amount),
        payer,
        splitBetween,
        date: FieldValue.serverTimestamp(),
      });
      res.json({ id: expenseRef.id });
    } catch (error) {
      console.error("Error adding expense:", error);
      res.status(500).json({ error: "Failed to add expense" });
    }
  });

  // Calculate balances (The "Heavy" part)
  app.get("/api/groups/:id/balances", async (req, res) => {
    try {
      const expensesSnapshot = await db.collection("expenses")
        .where("groupId", "==", req.params.id)
        .get();

      const groupDoc = await db.collection("groups").doc(req.params.id).get();
      const members = groupDoc.data()?.members || [];
      
      const balances: Record<string, number> = {};
      members.forEach((m: string) => balances[m] = 0);

      expensesSnapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.amount;
        const payer = data.payer;
        const splitBetween = data.splitBetween || members;

        // Payer is owed
        balances[payer] += amount;

        // Everyone in splitBetween owes their share
        const share = amount / splitBetween.length;
        splitBetween.forEach((member: string) => {
          balances[member] -= share;
        });
      });

      res.json({ balances });
    } catch (error) {
      console.error("Error calculating balances:", error);
      res.status(500).json({ error: "Failed to calculate balances" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
