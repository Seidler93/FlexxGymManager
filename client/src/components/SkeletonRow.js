import './SkeletonRow.css'

export default function SkeletonRow({ columns }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className="skeleton-loader" />
        </td>
      ))}
    </tr>
  );
}
