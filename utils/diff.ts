import { TallySchema, TallyProperty, SchemaDiff } from '../types';

export const compareSchemas = (oldSchema: TallySchema, newSchema: TallySchema): SchemaDiff => {
  const diff: SchemaDiff = {
    HasChanges: false,
    AddedProperties: {},
    DeletedProperties: {},
    ModifiedProperties: {},
    AddedMeta: {},
    DeletedMeta: {},
    ModifiedMeta: {},
    NameChanged: oldSchema.Name !== newSchema.Name,
    OldName: oldSchema.Name,
    NewName: newSchema.Name,
  };

  if (diff.NameChanged) {
      diff.HasChanges = true;
  }

  // Compare Meta
  const oldMetaKeys = Object.keys(oldSchema.Meta);
  const newMetaKeys = Object.keys(newSchema.Meta);

  newMetaKeys.forEach(key => {
    if (!oldMetaKeys.includes(key)) {
      diff.AddedMeta[key] = newSchema.Meta[key];
      diff.HasChanges = true;
    } else if (oldSchema.Meta[key] !== newSchema.Meta[key]) {
      diff.ModifiedMeta[key] = { oldValue: oldSchema.Meta[key], newValue: newSchema.Meta[key] };
      diff.HasChanges = true;
    }
  });

  oldMetaKeys.forEach(key => {
    if (!newMetaKeys.includes(key)) {
      diff.DeletedMeta[key] = newSchema.Meta[key];
      diff.HasChanges = true;
    }
  });

  // Compare Properties
  const oldPropKeys = Object.keys(oldSchema.Properties);
  const newPropKeys = Object.keys(newSchema.Properties);

  newPropKeys.forEach(key => {
    if (!oldPropKeys.includes(key)) {
      diff.AddedProperties[key] = newSchema.Properties[key];
      diff.HasChanges = true;
    } else {
      const oldProp = oldSchema.Properties[key];
      const newProp = newSchema.Properties[key];
      if (JSON.stringify(oldProp) !== JSON.stringify(newProp)) {
        diff.ModifiedProperties[key] = { old: oldProp, new: newProp };
        diff.HasChanges = true;
      }
    }
  });

  oldPropKeys.forEach(key => {
    if (!newPropKeys.includes(key)) {
      diff.DeletedProperties[key] = oldSchema.Properties[key];
      diff.HasChanges = true;
    }
  });

  return diff;
};
