import { useState } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Badge, 
  Button, 
  TextInput, 
  Select, 
  SelectItem, 
  MultiSelect, 
  MultiSelectItem,
  Card,
  Title,
  Flex,
  Text,
  Icon,
  Divider,
  DateRangePicker,
  DateRangePickerItem
} from '@tremor/react';
import { useProblems } from '../../hooks/useProblems';
import { 
  Problem, 
  ProblemStatus, 
  ProblemPriority, 
  ProblemImpact,
  ProblemFilters
} from '../../types/problem.types';

const statusOptions = Object.values(ProblemStatus);
const priorityOptions = Object.values(ProblemPriority);
const impactOptions = Object.values(ProblemImpact);

const statusBadgeMap = {
  [ProblemStatus.IDENTIFIED]: 'blue',
  [ProblemStatus.IN_ANALYSIS]: 'yellow',
  [ProblemStatus.KNOWN_ERROR]: 'orange',
  [ProblemStatus.RESOLVED]: 'green',
  [ProblemStatus.CLOSED]: 'gray',
};

const priorityBadgeMap = {
  [ProblemPriority.LOW]: 'gray',
  [ProblemPriority.MEDIUM]: 'blue',
  [ProblemPriority.HIGH]: 'yellow',
  [ProblemPriority.CRITICAL]: 'red',
};

export function ProblemList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Partial<ProblemFilters>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const { data, isLoading, isError, error } = useProblems(filters, page, limit);
  
  const handleFilterChange = (key: keyof ProblemFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };
  
  const handleRowClick = (problem: Problem) => {
    router.push(`/problems/${problem.id}`);
  };

  if (isError) {
    return (
      <Card className="mt-6">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading problems</p>
          <p className="text-sm text-gray-500 mt-2">{error?.message || 'Please try again later'}</p>
          <Button 
            variant="light" 
            icon={ArrowPathIcon}
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title>Problem Management</Title>
          <Text className="mt-1">View and manage all reported problems</Text>
        </div>
        <Button 
          icon={PlusIcon}
          onClick={() => router.push('/problems/new')}
        >
          New Problem
        </Button>
      </div>
      
      <Card className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <TextInput
                icon={FunnelIcon}
                placeholder="Search problems..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              />
            </div>
            <Button 
              variant="light" 
              icon={FunnelIcon}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <MultiSelect
                  value={filters.status || []}
                  onValueChange={(values) => handleFilterChange('status', values)}
                >
                  {statusOptions.map((status) => (
                    <MultiSelectItem key={status} value={status}>
                      {status.split('_').map(word => 
                        word.charAt(0) + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <MultiSelect
                  value={filters.priority || []}
                  onValueChange={(values) => handleFilterChange('priority', values)}
                >
                  {priorityOptions.map((priority) => (
                    <MultiSelectItem key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                <MultiSelect
                  value={filters.impact || []}
                  onValueChange={(values) => handleFilterChange('impact', values)}
                >
                  {impactOptions.map((impact) => (
                    <MultiSelectItem key={impact} value={impact}>
                      {impact.charAt(0) + impact.slice(1).toLowerCase()}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              </div>
              
              <div className="flex items-end space-x-2 md:col-span-3">
                <Button 
                  variant="light" 
                  onClick={handleResetFilters}
                  disabled={Object.keys(filters).length === 0}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <Divider />
        
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Priority</TableHeaderCell>
                <TableHeaderCell>Impact</TableHeaderCell>
                <TableHeaderCell>Reported</TableHeaderCell>
                <TableHeaderCell>Assigned To</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <Icon icon={ArrowPathIcon} className="animate-spin h-5 w-5 text-blue-500" />
                      <span className="ml-2">Loading problems...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No problems found. Try adjusting your filters or create a new problem.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((problem) => (
                  <TableRow 
                    key={problem.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(problem)}
                  >
                    <TableCell>
                      <Text>#{problem.id.split('-')[0]}</Text>
                    </TableCell>
                    <TableCell>
                      <Text className="font-medium">{problem.title}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        color={statusBadgeMap[problem.status]}
                        className="capitalize"
                      >
                        {problem.status.split('_').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        color={priorityBadgeMap[problem.priority]}
                        className="capitalize"
                      >
                        {problem.priority.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        color={priorityBadgeMap[problem.impact]}
                        className="capitalize"
                      >
                        {problem.impact.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text>{new Date(problem.createdAt).toLocaleDateString()}</Text>
                    </TableCell>
                    <TableCell>
                      {problem.assignedTo ? (
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                          <Text>
                            {problem.assignedTo.firstName} {problem.assignedTo.lastName}
                          </Text>
                        </div>
                      ) : (
                        <Text className="text-gray-400">Unassigned</Text>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {data && data.total > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                variant="light" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="light"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, data.total)}
                  </span>{' '}
                  of <span className="font-medium">{data.total}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(Number(value))}
                  className="w-20"
                >
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </Select>
                <div className="flex rounded-md shadow-sm">
                  <Button
                    variant="light"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-r-none"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= data.totalPages}
                    className="rounded-l-none -ml-px"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
