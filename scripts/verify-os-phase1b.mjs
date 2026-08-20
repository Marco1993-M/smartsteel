import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

function parseEnvFile(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith("#"))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf("=")
      if (separatorIndex === -1) return acc

      const key = line.slice(0, separatorIndex).trim()
      let value = line.slice(separatorIndex + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      acc[key] = value
      return acc
    }, {})
}

function getSupabaseClient() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local")
  }

  const env = {
    ...parseEnvFile(envPath),
    ...process.env,
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables for verification.")
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

async function assertTableVisible(supabase, tableName) {
  const { error } = await supabase.from(tableName).select("*").limit(1)
  if (error) {
    throw new Error(`${tableName} visibility failed: ${error.code || "unknown"} ${error.message}`)
  }
}

async function main() {
  const supabase = getSupabaseClient()
  const requiredTables = [
    "platforms",
    "product_families",
    "os_documents",
    "os_catalog_items",
    "os_boms",
    "os_bom_lines",
  ]
  const cleanupTasks = []
  const stamp = `codex-${Date.now()}`

  try {
    for (const tableName of requiredTables) {
      await assertTableVisible(supabase, tableName)
    }

    const { data: families, error: familyInsertError } = await supabase
      .from("product_families")
      .insert([
        {
          platform_key: "atlas",
          key: `${stamp}-atlas-family`,
          name: `${stamp} Atlas Verification Family`,
          summary: "Temporary verification record for Smart Steel OS activation.",
          status: "draft",
          owner: "Codex",
          quote_ready: false,
          metadata: { sampleProducts: ["Verification product"] },
        },
        {
          platform_key: "lsf",
          key: `${stamp}-lsf-family`,
          name: `${stamp} LSF Verification Family`,
          summary: "Temporary verification record for Smart Steel OS activation.",
          status: "draft",
          owner: "Codex",
          quote_ready: false,
          metadata: { sampleProducts: ["Verification product"] },
        },
      ])
      .select()

    if (familyInsertError) {
      throw new Error(`product_families insert failed: ${familyInsertError.message}`)
    }

    cleanupTasks.push(async () => {
      await supabase.from("product_families").delete().in("id", families.map((item) => item.id))
    })

    const atlasFamily = families.find((item) => item.platform_key === "atlas")
    const lsfFamily = families.find((item) => item.platform_key === "lsf")

    const { data: atlasFamilyUpdate, error: atlasFamilyUpdateError } = await supabase
      .from("product_families")
      .update({ quote_ready: true, status: "active" })
      .eq("id", atlasFamily.id)
      .select()
      .single()

    if (atlasFamilyUpdateError) {
      throw new Error(`product_families update failed: ${atlasFamilyUpdateError.message}`)
    }

    const { data: atlasDocument, error: atlasDocumentError } = await supabase
      .from("os_documents")
      .insert([
        {
          platform_key: "atlas",
          product_family_id: atlasFamily.id,
          title: `${stamp} Atlas Verification Document`,
          document_type: "scope_reference",
          status: "draft",
          revision_code: "VR1",
          owner: "Codex",
          client_visible: false,
          notes: "Temporary verification document.",
        },
      ])
      .select()
      .single()

    if (atlasDocumentError) {
      throw new Error(`os_documents insert failed: ${atlasDocumentError.message}`)
    }

    cleanupTasks.push(async () => {
      await supabase.from("os_documents").delete().eq("id", atlasDocument.id)
    })

    const { data: atlasDocumentUpdate, error: atlasDocumentUpdateError } = await supabase
      .from("os_documents")
      .update({ status: "issued", last_sent_at: new Date().toISOString() })
      .eq("id", atlasDocument.id)
      .select()
      .single()

    if (atlasDocumentUpdateError) {
      throw new Error(`os_documents update failed: ${atlasDocumentUpdateError.message}`)
    }

    const { data: atlasComponent, error: atlasComponentError } = await supabase
      .from("os_catalog_items")
      .insert([
        {
          platform_key: "atlas",
          kind: "component",
          product_family_id: atlasFamily.id,
          category: "Verification",
          title: `${stamp} Atlas Verification Component`,
          summary: "Temporary Atlas component verification record.",
          status: "draft",
          owner: "Codex",
          metadata: { tags: ["Verification", "Atlas"] },
        },
      ])
      .select()
      .single()

    if (atlasComponentError) {
      throw new Error(`atlas component insert failed: ${atlasComponentError.message}`)
    }

    cleanupTasks.push(async () => {
      await supabase.from("os_catalog_items").delete().eq("id", atlasComponent.id)
    })

    const { data: atlasComponentUpdate, error: atlasComponentUpdateError } = await supabase
      .from("os_catalog_items")
      .update({ status: "active" })
      .eq("id", atlasComponent.id)
      .select()
      .single()

    if (atlasComponentUpdateError) {
      throw new Error(`atlas component update failed: ${atlasComponentUpdateError.message}`)
    }

    const { data: atlasBom, error: atlasBomError } = await supabase
      .from("os_boms")
      .insert([
        {
          platform_key: "atlas",
          product_family_id: atlasFamily.id,
          code: `${stamp}-atlas-bom`,
          title: `${stamp} Atlas Verification BOM`,
          description: "Temporary BOM verification record.",
          revision_code: "VR1",
          status: "draft",
          owner: "Codex",
        },
      ])
      .select()
      .single()

    if (atlasBomError) {
      throw new Error(`os_boms insert failed: ${atlasBomError.message}`)
    }

    cleanupTasks.push(async () => {
      await supabase.from("os_boms").delete().eq("id", atlasBom.id)
    })

    const { data: atlasBomLine, error: atlasBomLineError } = await supabase
      .from("os_bom_lines")
      .insert([
        {
          bom_id: atlasBom.id,
          catalog_item_id: atlasComponent.id,
          line_number: 10,
          category: "Verification",
          description: "Temporary verification BOM line.",
          quantity: 1,
          unit: "each",
          waste_factor: 0.05,
          scope: "standard",
          notes: "Temporary verification line.",
        },
      ])
      .select()
      .single()

    if (atlasBomLineError) {
      throw new Error(`os_bom_lines insert failed: ${atlasBomLineError.message}`)
    }

    const { data: atlasBomUpdate, error: atlasBomUpdateError } = await supabase
      .from("os_boms")
      .update({ status: "approved" })
      .eq("id", atlasBom.id)
      .select()
      .single()

    if (atlasBomUpdateError) {
      throw new Error(`os_boms update failed: ${atlasBomUpdateError.message}`)
    }

    const { data: lsfModule, error: lsfModuleError } = await supabase
      .from("os_catalog_items")
      .insert([
        {
          platform_key: "lsf",
          kind: "module",
          product_family_id: lsfFamily.id,
          category: "Verification",
          title: `${stamp} LSF Verification Module`,
          summary: "Temporary LSF module verification record.",
          status: "draft",
          owner: "Codex",
          metadata: { tags: ["Verification", "LSF"] },
        },
      ])
      .select()
      .single()

    if (lsfModuleError) {
      throw new Error(`lsf module insert failed: ${lsfModuleError.message}`)
    }

    cleanupTasks.push(async () => {
      await supabase.from("os_catalog_items").delete().eq("id", lsfModule.id)
    })

    const { data: lsfModuleUpdate, error: lsfModuleUpdateError } = await supabase
      .from("os_catalog_items")
      .update({ status: "needs_review" })
      .eq("id", lsfModule.id)
      .select()
      .single()

    if (lsfModuleUpdateError) {
      throw new Error(`lsf module update failed: ${lsfModuleUpdateError.message}`)
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          verified: {
            requiredTables,
            atlasProductFamily: {
              id: atlasFamilyUpdate.id,
              status: atlasFamilyUpdate.status,
              quoteReady: atlasFamilyUpdate.quote_ready,
            },
            lsfProductFamily: {
              id: lsfFamily.id,
              status: lsfFamily.status,
              quoteReady: lsfFamily.quote_ready,
            },
            atlasDocument: {
              id: atlasDocumentUpdate.id,
              status: atlasDocumentUpdate.status,
            },
            atlasComponent: {
              id: atlasComponentUpdate.id,
              status: atlasComponentUpdate.status,
            },
            atlasBom: {
              id: atlasBomUpdate.id,
              status: atlasBomUpdate.status,
              lineId: atlasBomLine.id,
            },
            lsfModule: {
              id: lsfModuleUpdate.id,
              status: lsfModuleUpdate.status,
            },
          },
        },
        null,
        2
      )
    )
  } finally {
    while (cleanupTasks.length > 0) {
      const task = cleanupTasks.pop()
      try {
        await task()
      } catch (error) {
        console.error(`Cleanup warning: ${error.message}`)
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
