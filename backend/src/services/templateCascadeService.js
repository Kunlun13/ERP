import Student from '../models/Student.js';

/**
 * Cascade template field changes to every active student in a session.
 *
 * @param {object} options
 * @param {string|ObjectId} options.sessionId      - The session scope
 * @param {object[]}        options.addedFields    - New template fields not previously present
 * @param {string[]}        options.removedKeys    - Field keys removed from the template
 * @param {Set<string>}     options.standardFieldKeys - Keys that live as top-level Student props
 *
 * @returns {{ studentsUpdated: number }}
 */
export async function applyTemplateToAllStudents({
  sessionId,
  addedFields,
  removedKeys,
  standardFieldKeys,
}) {
  // Nothing to do if template diff is empty
  if (addedFields.length === 0 && removedKeys.length === 0) {
    return { studentsUpdated: 0 };
  }

  const students = await Student.find({ sessionId, isActive: true }).lean();

  if (students.length === 0) return { studentsUpdated: 0 };

  const bulkOps = students.map((student) => {
    const $set   = {};
    const $unset = {};

    // ── Add new fields with null as placeholder ──────────────────────────
    for (const field of addedFields) {
      const isStandard = standardFieldKeys.has(field.key);

      if (isStandard) {
        // Only set if the top-level field is currently absent / undefined
        if (student[field.key] === undefined || student[field.key] === null) {
          $set[field.key] = null;
        }
      } else {
        // Custom field: only set if not already in the map
        const existingCustom = student.customFields
          ? (student.customFields instanceof Map
            ? student.customFields.get(field.key)
            : student.customFields[field.key])
          : undefined;

        if (existingCustom === undefined || existingCustom === null) {
          $set[`customFields.${field.key}`] = null;
        }
      }
    }

    // ── Remove fields that are no longer in the template ────────────────
    for (const key of removedKeys) {
      // Never remove immutable / system fields
      const immutable = new Set([
        'sessionId', '_id', 'isActive', 'createdBy', 'updatedBy',
        'createdAt', 'updatedAt', 'rollNo',
      ]);
      if (immutable.has(key)) continue;

      const isStandard = standardFieldKeys.has(key);
      if (isStandard) {
        $unset[key] = '';
      } else {
        $unset[`customFields.${key}`] = '';
      }
    }

    const update = {};
    if (Object.keys($set).length > 0)   update.$set   = $set;
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    return {
      updateOne: {
        filter: { _id: student._id },
        update,
      },
    };
  });

  // Filter out no-op operations (both $set and $unset are empty)
  const effectiveOps = bulkOps.filter((op) => Object.keys(op.updateOne.update).length > 0);

  if (effectiveOps.length === 0) return { studentsUpdated: 0 };

  const result = await Student.bulkWrite(effectiveOps, { ordered: false });

  return { studentsUpdated: result.modifiedCount };
}