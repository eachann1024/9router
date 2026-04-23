import { NextResponse } from "next/server";
import { getComboById, updateCombo, deleteCombo, getComboByName, getSettings, updateSettings } from "@/lib/localDb";

// Validate combo name: only a-z, A-Z, 0-9, -, _
const VALID_NAME_REGEX = /^[a-zA-Z0-9_.\-]+$/;

// GET /api/combos/[id] - Get combo by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const combo = await getComboById(id);
    
    if (!combo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }
    
    return NextResponse.json(combo);
  } catch (error) {
    console.log("Error fetching combo:", error);
    return NextResponse.json({ error: "Failed to fetch combo" }, { status: 500 });
  }
}

// PUT /api/combos/[id] - Update combo
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const previousCombo = await getComboById(id);

    if (!previousCombo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }
    
    // Validate name format if provided
    if (body.name) {
      if (!VALID_NAME_REGEX.test(body.name)) {
        return NextResponse.json({ error: "Name can only contain letters, numbers, -, _ and ." }, { status: 400 });
      }
      
      // Check if name already exists (exclude current combo)
      const existing = await getComboByName(body.name);
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Combo name already exists" }, { status: 400 });
      }
    }
    
    const combo = await updateCombo(id, body);

    if (body.name && body.name !== previousCombo.name) {
      const settings = await getSettings();
      const comboStrategies = { ...(settings.comboStrategies || {}) };
      if (comboStrategies[previousCombo.name]) {
        comboStrategies[body.name] = {
          ...comboStrategies[previousCombo.name],
          openrouterFreeSyncComboId: combo.id,
        };
        delete comboStrategies[previousCombo.name];
        await updateSettings({ comboStrategies });
      }
    }

    return NextResponse.json(combo);
  } catch (error) {
    console.log("Error updating combo:", error);
    return NextResponse.json({ error: "Failed to update combo" }, { status: 500 });
  }
}

// DELETE /api/combos/[id] - Delete combo
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const combo = await getComboById(id);
    const success = await deleteCombo(id);
    
    if (!success) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }

    if (combo) {
      const settings = await getSettings();
      const comboStrategies = { ...(settings.comboStrategies || {}) };
      if (comboStrategies[combo.name]) {
        delete comboStrategies[combo.name];
        await updateSettings({ comboStrategies });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting combo:", error);
    return NextResponse.json({ error: "Failed to delete combo" }, { status: 500 });
  }
}
