import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button, Table, Badge, Card, TextInput, Select, SelectItem } from '@tremor/react';
import { useIncidents } from '../../hooks/useIncidents';
import { Incident, IncidentStatus, IncidentPriority } from '../../types/incident.types';

const ITEMS_PER_PAGE = 10;

export function IncidentList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const { data, isLoading } = useIncidents(
    {
      status: filters.status as IncidentStatus || undefined,
      priority: filters.priority as IncidentPriority || undefined,
      search: filters.search || undefined,
    },
    page,
    ITEMS_PER_PAGE
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Incidents</h2>
        <Link href="/incidents/new">
          <Button icon={PlusIcon} size="sm">New Incident</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TextInput
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectItem value="">All Statuses</SelectItem>
          {Object.values(IncidentStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </Select>
        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value })}
        >
          <SelectItem value="">All Priorities</SelectItem>
          {Object.values(IncidentPriority).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Table>
        <thead>
          <tr>
            <th className="text-left">Title</th>
            <th className="text-left">Status</th>
            <th className="text-left">Priority</th>
            <th className="text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((incident) => (
            <tr 
              key={incident.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/incidents/${incident.id}`)}
            >
              <td className="py-2">
                <div className="font-medium">{incident.title}</div>
                <div className="text-sm text-gray-500">#{incident.id.split('-')[0]}</div>
              </td>
              <td>
                <Badge color={
                  incident.status === IncidentStatus.OPEN ? 'blue' :
                  incident.status === IncidentStatus.IN_PROGRESS ? 'yellow' :
                  'gray'
                }>
                  {incident.status}
                </Badge>
              </td>
              <td>
                <Badge color={
                  incident.priority === IncidentPriority.HIGH ? 'red' :
                  incident.priority === IncidentPriority.MEDIUM ? 'yellow' :
                  'gray'
                }>
                  {incident.priority}
                </Badge>
              </td>
              <td>{format(new Date(incident.createdAt), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
