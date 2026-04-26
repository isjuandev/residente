"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ClinicalTableValue {
  title: string;
  headers: string[];
  rows: string[][];
}

interface TableBuilderProps {
  value: ClinicalTableValue[];
  onChange: (tables: ClinicalTableValue[]) => void;
}

const emptyTable: ClinicalTableValue = {
  title: "Nueva tabla",
  headers: ["Columna 1", "Columna 2"],
  rows: [["", ""]]
};

export function TableBuilder({ value, onChange }: TableBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function updateTable(index: number, table: ClinicalTableValue) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? table : item)));
  }

  function removeTable(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((_, index) => tableId(index) === active.id);
    const newIndex = value.findIndex((_, index) => tableId(index) === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">Tablas clínicas</h4>
          <p className="mt-1 text-sm text-slate-500">
            Construye tablas estructuradas con filas, columnas y orden editable.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...value, cloneTable(emptyTable)])}
          className="rounded-md bg-[#1A5276] px-3 py-2 text-sm font-semibold text-white"
        >
          Agregar tabla
        </button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          No hay tablas clínicas.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((_, index) => tableId(index))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {value.map((table, index) => (
                <SortableTableEditor
                  key={tableId(index)}
                  id={tableId(index)}
                  table={table}
                  index={index}
                  onChange={(nextTable) => updateTable(index, nextTable)}
                  onRemove={() => removeTable(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableTableEditor({
  id,
  table,
  index,
  onChange,
  onRemove
}: Readonly<{
  id: string;
  table: ClinicalTableValue;
  index: number;
  onChange: (table: ClinicalTableValue) => void;
  onRemove: () => void;
}>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  function updateHeader(headerIndex: number, header: string) {
    onChange({
      ...table,
      headers: table.headers.map((item, index) =>
        index === headerIndex ? header : item
      )
    });
  }

  function updateCell(rowIndex: number, columnIndex: number, cell: string) {
    onChange({
      ...table,
      rows: table.rows.map((row, index) =>
        index === rowIndex
          ? row.map((item, innerIndex) =>
              innerIndex === columnIndex ? cell : item
            )
          : row
      )
    });
  }

  function addColumn() {
    onChange({
      ...table,
      headers: [...table.headers, `Columna ${table.headers.length + 1}`],
      rows: table.rows.map((row) => [...row, ""])
    });
  }

  function removeColumn(columnIndex: number) {
    if (table.headers.length <= 1) return;
    onChange({
      ...table,
      headers: table.headers.filter((_, index) => index !== columnIndex),
      rows: table.rows.map((row) =>
        row.filter((_, index) => index !== columnIndex)
      )
    });
  }

  function addRow() {
    onChange({
      ...table,
      rows: [...table.rows, table.headers.map(() => "")]
    });
  }

  function removeRow(rowIndex: number) {
    onChange({
      ...table,
      rows: table.rows.filter((_, index) => index !== rowIndex)
    });
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab rounded border px-2 py-1 text-sm text-slate-500"
          aria-label={`Reordenar tabla ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          ::
        </button>
        <input
          value={table.title}
          onChange={(event) => onChange({ ...table, title: event.target.value })}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 font-medium"
          placeholder="Título de tabla"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
        >
          Eliminar
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr>
              {table.headers.map((header, headerIndex) => (
                <th key={headerIndex} className="border border-slate-200 p-2">
                  <div className="flex gap-2">
                    <input
                      value={header}
                      onChange={(event) =>
                        updateHeader(headerIndex, event.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(headerIndex)}
                      className="text-red-700"
                      aria-label="Eliminar columna"
                    >
                      x
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-16 border border-slate-200 p-2">Fila</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.headers.map((_, columnIndex) => (
                  <td key={columnIndex} className="border border-slate-200 p-2">
                    <input
                      value={row[columnIndex] ?? ""}
                      onChange={(event) =>
                        updateCell(rowIndex, columnIndex, event.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                ))}
                <td className="border border-slate-200 p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="text-red-700"
                    aria-label="Eliminar fila"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border px-3 py-2 text-sm font-semibold"
        >
          Agregar fila
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="rounded-md border px-3 py-2 text-sm font-semibold"
        >
          Agregar columna
        </button>
      </div>

      <div className="mt-4 rounded-md bg-[#F8F9FA] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1A5276]">
          Preview
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr>
                {table.headers.map((header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className="border border-slate-200 bg-white px-3 py-2 text-left"
                  >
                    {header || `Columna ${headerIndex + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {table.headers.map((_, columnIndex) => (
                    <td
                      key={columnIndex}
                      className="border border-slate-200 bg-white px-3 py-2"
                    >
                      {row[columnIndex] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function tableId(index: number) {
  return `clinical-table-${index}`;
}

function cloneTable(table: ClinicalTableValue): ClinicalTableValue {
  return {
    title: table.title,
    headers: [...table.headers],
    rows: table.rows.map((row) => [...row])
  };
}
