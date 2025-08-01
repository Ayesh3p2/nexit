'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Badge, Button, TextInput, Card, Title, Text } from '@tremor/react';
import { ChangeStatus, ChangePriority, ChangeRequest, ChangeFilters, PaginatedChanges } from '../../types/change.types';
import { useChanges } from '../../hooks/useChanges';
import { format } from 'date-fns';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const statusColors: Record<ChangeStatus, 'gray' | 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'orange'> = {
  [ChangeStatus.DRAFT]: 'gray',
  [ChangeStatus.SUBMITTED]: 'blue',
  [ChangeStatus.IN_REVIEW]: 'yellow',
  [ChangeStatus.SCHEDULED]: 'purple',
  [ChangeStatus.IN_PROGRESS]: 'blue',
  [ChangeStatus.IMPLEMENTED]: 'green',
  [ChangeStatus.REJECTED]: 'red',
  [ChangeStatus.CLOSED]: 'green',
  [ChangeStatus.FAILED]: 'red',
  [ChangeStatus.ROLLED_BACK]: 'orange',
};

type PriorityColor = 'green' | 'yellow' | 'orange' | 'red';

const priorityColors: Record<ChangePriority, PriorityColor> = {
  [ChangePriority.LOW]: 'green',
  [ChangePriority.MEDIUM]: 'yellow',
  [ChangePriority.HIGH]: 'orange',
  [ChangePriority.CRITICAL]: 'red',
};

export function ChangeList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const filters: ChangeFilters = search ? { search } : {};
  const { data, isLoading, isError } = useChanges(filters, page, limit);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>No data available</div>;
  
  const paginatedData = data as unknown as PaginatedChanges;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title>Change Requests</Title>
        <Button icon={PlusIcon} onClick={() => router.push('/changes/new')}>
          New Change
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="Search changes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.items.map((change: ChangeRequest) => (
              <tr 
                key={change.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/changes/${change.id}`)}
              >
                <td>{change.title}</td>
                <td>
                  <Badge color={statusColors[change.status] as any}>
                    {change.status}
                  </Badge>
                </td>
                <td>
                  <Badge color={priorityColors[change.priority] as any}>
                    {change.priority}
                  </Badge>
                </td>
                <td>{format(new Date(change.createdAt), 'MMM dd, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-4 flex justify-between items-center">
          <Text>Page {page} of {Math.ceil(paginatedData.total / limit)}</Text>
          <div className="space-x-2">
            <Button 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
