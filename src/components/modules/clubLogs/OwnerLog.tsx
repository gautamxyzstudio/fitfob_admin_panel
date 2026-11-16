import type { ClubOwnerActivityLog } from "../../../api/clubRequest/clubRequest.types";

export interface FieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface ParsedDiff {
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  mainText: string;
  fieldChanges: FieldChange[];
}

export interface ItemizedDiff {
  hasListDiff: boolean;
  removedItems: string[];
  addedItems: string[];
}

const normalizeToken = (s: string) =>
  s.trim().toLowerCase().replace(/^['"]|['"]$/g, "").replace(/\s+/g, " ");



export const isListField = (fieldName?: string): boolean => {
  if (!fieldName) return false;
  const f = fieldName.toLowerCase();
  return /^(facilities|amenities|services)$/i.test(f);
};

/**
 * Parses description format, unifies multi-part address fields (street, city, pincode)
 * into a single unified clean address string, and STRICTLY EXCLUDES technical coordinates.
 */
export const parseLogDescription = (desc: string): ParsedDiff => {
  if (!desc) {
    return { mainText: "", fieldChanges: [] };
  }

  // Check if description has (Changed: ...)
  const changedBlockMatch = desc.match(/\(Changed:\s*(.+)\)$/is);
  if (changedBlockMatch) {
    const mainText = desc.replace(changedBlockMatch[0], "").trim();
    const changedContent = changedBlockMatch[1];

    // Pattern for field: 'old' -> 'new'
    const quotedPattern = /([\w]+):\s*'([^']*)'\s*->\s*'([^']*)'/g;
    const matches = [...changedContent.matchAll(quotedPattern)];

    let validChanges: FieldChange[] = [];

    const normalizeValue = (s: string) =>
      s.trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, " ");

    if (matches.length > 0) {
      validChanges = matches
        .map((m) => ({
          fieldName: m[1].trim(),
          oldValue: m[2].trim(),
          newValue: m[3].trim(),
        }))
        .filter((c) => {
          // Strictly exclude technical coordinate fields
          if (
            !c.fieldName ||
            /^(latitude|longitude|lat|lng|long|coord|coordinates)$/i.test(
              c.fieldName
            )
          ) {
            return false;
          }
          // STRICTLY EXCLUDE fields where value didn't change!
          return normalizeValue(c.oldValue) !== normalizeValue(c.newValue);
        });
    } else {
      const flexPattern = /([\w]+):\s*([^,->]+?)\s*->\s*([^,)]+)/g;
      const flexMatches = [...changedContent.matchAll(flexPattern)];
      if (flexMatches.length > 0) {
        validChanges = flexMatches
          .map((m) => ({
            fieldName: m[1].trim(),
            oldValue: m[2].replace(/^['"]|['"]$/g, "").trim(),
            newValue: m[3].replace(/^['"]|['"]$/g, "").trim(),
          }))
          .filter((c) => {
            if (
              !c.fieldName ||
              /^(latitude|longitude|lat|lng|long|coord|coordinates)$/i.test(
                c.fieldName
              )
            ) {
              return false;
            }
            // STRICTLY EXCLUDE fields where value didn't change!
            return normalizeValue(c.oldValue) !== normalizeValue(c.newValue);
          });
      }
    }

    if (validChanges.length > 0) {
      // Unify address fields into a single formatted address string
      const addressChange = validChanges.find((c) =>
        /^(clubaddress|address)$/i.test(c.fieldName)
      );
      const cityChange = validChanges.find((c) => /^city$/i.test(c.fieldName));
      const stateChange = validChanges.find((c) =>
        /^state$/i.test(c.fieldName)
      );
      const pincodeChange = validChanges.find((c) =>
        /^(pincode|zip|postalcode)$/i.test(c.fieldName)
      );

      if (addressChange || cityChange || stateChange || pincodeChange) {
        const oldParts = [
          addressChange?.oldValue,
          cityChange?.oldValue,
          stateChange?.oldValue,
        ].filter(Boolean);
        let oldFull = oldParts.join(", ");
        if (pincodeChange?.oldValue) {
          oldFull += ` - ${pincodeChange.oldValue}`;
        }

        const newParts = [
          addressChange?.newValue,
          cityChange?.newValue,
          stateChange?.newValue,
        ].filter(Boolean);
        let newFull = newParts.join(", ");
        if (pincodeChange?.newValue) {
          newFull += ` - ${pincodeChange.newValue}`;
        }

        const otherChanges = validChanges.filter(
          (c) =>
            !/^(clubaddress|address|city|state|pincode|zip|postalcode)$/i.test(
              c.fieldName
            )
        );

        const unifiedAddress: FieldChange = {
          fieldName: "clubAddress",
          oldValue: oldFull,
          newValue: newFull,
        };

        const finalChanges = [
          ...(oldFull.trim() !== newFull.trim() && (oldFull || newFull)
            ? [unifiedAddress]
            : []),
          ...otherChanges,
        ];

        if (finalChanges.length > 0) {
          return {
            fieldName: finalChanges[0].fieldName,
            oldValue: finalChanges[0].oldValue,
            newValue: finalChanges[0].newValue,
            mainText: mainText || "Updated club details",
            fieldChanges: finalChanges,
          };
        }
      }

      return {
        fieldName: validChanges[0].fieldName,
        oldValue: validChanges[0].oldValue,
        newValue: validChanges[0].newValue,
        mainText: mainText || "Updated club details",
        fieldChanges: validChanges,
      };
    }
  }

  return { mainText: desc, fieldChanges: [] };
};

/**
 * Computes specific items added vs removed ONLY for list-based fields (e.g. facilities/amenities).
 */
export const computeItemizedDiff = (
  oldVal?: string,
  newVal?: string,
  fieldName?: string
): ItemizedDiff => {
  if (
    !oldVal ||
    !newVal ||
    !fieldName ||
    !isListField(fieldName) ||
    (!oldVal.includes(",") && !newVal.includes(","))
  ) {
    return { hasListDiff: false, removedItems: [], addedItems: [] };
  }

  const oldItems = oldVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const newItems = newVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const removed = oldItems.filter(
    (item) =>
      !newItems.some((n) => normalizeToken(n) === normalizeToken(item))
  );
  const added = newItems.filter(
    (item) =>
      !oldItems.some((o) => normalizeToken(o) === normalizeToken(item))
  );

  if (removed.length > 0 || added.length > 0) {
    return {
      hasListDiff: true,
      removedItems: removed,
      addedItems: added,
    };
  }

  return { hasListDiff: false, removedItems: [], addedItems: [] };
};

/**
 * Renders the Previous/Old Value:
 * For list fields: Only removed items get crossed out. Kept items remain clean text.
 * Commas are attached directly without leading whitespace.
 */
export const renderOldValueDiff = (
  oldVal: string,
  newVal: string,
  fieldName?: string
) => {
  if (!oldVal) return null;
  const isList = isListField(fieldName);

  // List field (facilities, amenities)
  if (isList && oldVal.includes(",")) {
    const oldItems = oldVal.split(",").map((s) => s.trim());
    const newItemsNormalized = newVal
      .split(",")
      .map((s) => normalizeToken(s));

    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {oldItems.map((item, idx) => {
          const isKept = newItemsNormalized.includes(normalizeToken(item));
          return (
            <span key={idx} className="inline-flex items-center">
              {isKept ? (
                <span className="text-gray-800 font-normal">{item}</span>
              ) : (
                <span className="line-through bg-rose-200/80 text-rose-900 font-semibold px-1.5 py-0.5 rounded border border-rose-300">
                  {item}
                </span>
              )}
              {idx < oldItems.length - 1 && (
                <span className="text-secondary-text mr-1">,</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Address, timing, or single field: clean unified continuous text
  return (
    <div className="text-xs sm:text-sm font-medium text-gray-800 font-sans leading-relaxed">
      {oldVal}
    </div>
  );
};

/**
 * Renders the Updated/New Value:
 * For list fields: Highlights newly added items with green badge.
 * Commas are attached directly without leading whitespace.
 */
export const renderNewValueDiff = (
  oldVal: string,
  newVal: string,
  fieldName?: string
) => {
  if (!newVal) return null;
  const isList = isListField(fieldName);

  // List field (facilities, amenities)
  if (isList && newVal.includes(",")) {
    const newItems = newVal.split(",").map((s) => s.trim());
    const oldItemsNormalized = oldVal
      .split(",")
      .map((s) => normalizeToken(s));

    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {newItems.map((item, idx) => {
          const isPreExisting = oldItemsNormalized.includes(
            normalizeToken(item)
          );
          return (
            <span key={idx} className="inline-flex items-center">
              {isPreExisting ? (
                <span className="text-gray-800 font-normal">{item}</span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  + {item}
                </span>
              )}
              {idx < newItems.length - 1 && (
                <span className="text-secondary-text mr-1">,</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Address, timing, or single field: clean unified continuous text
  return (
    <div className="text-xs sm:text-sm font-semibold text-emerald-950 font-sans leading-relaxed">
      {newVal}
    </div>
  );
};

export const matchesLogCategory = (
  log: ClubOwnerActivityLog,
  category: string
): boolean => {
  if (category === "ALL") return true;

  const parsed = parseLogDescription(log.description);
  const entity = (log.entityName || "").toLowerCase();
  const desc = (log.description || "").toLowerCase();
  const cat = category.toLowerCase();

  const fieldNames = parsed.fieldChanges.map((f) => f.fieldName.toLowerCase());

  if (cat === "location") {
    return (
      entity.includes("location") ||
      entity.includes("address") ||
      fieldNames.some((f) =>
        /^(clubaddress|address|city|state|pincode|zip|location)$/i.test(f)
      ) ||
      desc.includes("location") ||
      desc.includes("address") ||
      desc.includes("city")
    );
  }

  if (cat === "facilities") {
    return (
      entity.includes("facilit") ||
      entity.includes("amenit") ||
      fieldNames.some((f) => /^(facilities|amenities|services)$/i.test(f)) ||
      desc.includes("facilit") ||
      desc.includes("amenit")
    );
  }

  if (cat === "profile") {
    return (
      entity.includes("profile") ||
      entity.includes("club") ||
      fieldNames.some((f) =>
        /^(clubname|ownername|phone|phonenumber|email|weekdayscheduling|weekendscheduling|scheduling|timings)$/i.test(
          f
        )
      ) ||
      desc.includes("profile")
    );
  }

  return (
    entity.includes(cat) ||
    desc.includes(cat) ||
    fieldNames.some((f) => f.includes(cat))
  );
};