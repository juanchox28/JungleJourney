import FilterBar from '../FilterBar';

export default function FilterBarExample() {
  return (
    <div className="p-8">
      <FilterBar 
        onFilterChange={(filters) => console.log('Selected filters:', filters)}
      />
    </div>
  );
}
