import { format } from 'date-fns';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  UserCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { Timeline, TimelineItem, TimelineHeader, TimelineIcon, TimelineBody } from '@tremor/react';
import { Problem, ProblemStatus, ProblemEvent } from '../../types/problem.types';

interface ProblemTimelineProps {
  events: ProblemEvent[];
  className?: string;
}

const eventIcons = {
  // Status icons
  [ProblemStatus.IDENTIFIED]: InformationCircleIcon,
  [ProblemStatus.IN_ANALYSIS]: ClockIcon,
  [ProblemStatus.KNOWN_ERROR]: ExclamationCircleIcon,
  [ProblemStatus.RESOLVED]: CheckCircleIcon,
  [ProblemStatus.CLOSED]: XCircleIcon,
  
  // Event type icons
  comment: UserCircleIcon,
  assignment: UserIcon,
  workaround: WrenchScrewdriverIcon,
  solution: LightBulbIcon,
  
  // Default
  default: InformationCircleIcon
};

const eventColors = {
  // Status colors
  [ProblemStatus.IDENTIFIED]: 'blue',
  [ProblemStatus.IN_ANALYSIS]: 'yellow',
  [ProblemStatus.KNOWN_ERROR]: 'orange',
  [ProblemStatus.RESOLVED]: 'green',
  [ProblemStatus.CLOSED]: 'gray',
  
  // Event type colors
  comment: 'indigo',
  assignment: 'purple',
  workaround: 'amber',
  solution: 'emerald',
  
  // Default
  default: 'gray'
};

const statusLabels = {
  [ProblemStatus.IDENTIFIED]: 'Identified',
  [ProblemStatus.IN_ANALYSIS]: 'In Analysis',
  [ProblemStatus.KNOWN_ERROR]: 'Known Error',
  [ProblemStatus.RESOLVED]: 'Resolved',
  [ProblemStatus.CLOSED]: 'Closed'
};

export function ProblemTimeline({ events, className = '' }: ProblemTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No activity yet
      </div>
    );
  }

  return (
    <div className={className}>
      <Timeline>
        {events.map((event, index) => {
          const Icon = eventIcons[event.type] || eventIcons.default;
          const color = eventColors[event.type] || eventColors.default;
          
          return (
            <TimelineItem key={index}>
              <TimelineHeader>
                <TimelineIcon color={color} icon={Icon} />
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                  <span className="font-medium text-gray-900">
                    {`${event.user.firstName} ${event.user.lastName}`}
                  </span>
                  <span className="text-sm text-gray-500 ml-0 sm:ml-2">
                    {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </TimelineHeader>
              <TimelineBody className="mt-1">
                <div className="text-gray-700">
                  {Object.values(ProblemStatus).includes(event.type as ProblemStatus) ? (
                    <div>
                      {event.previousStatus ? (
                        <>
                          Changed status from <span className="font-medium">
                            {statusLabels[event.previousStatus]}
                          </span> to <span className="font-medium">
                            {statusLabels[event.type as ProblemStatus]}
                          </span>
                        </>
                      ) : (
                        <>
                          Status set to <span className="font-medium">
                            {statusLabels[event.type as ProblemStatus]}
                          </span>
                        </>
                      )}
                      {event.isWorkaround && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Workaround
                        </span>
                      )}
                    </div>
                  ) : event.type === 'comment' ? (
                    <div>Added a comment</div>
                  ) : event.type === 'assignment' ? (
                    <div>Assigned to {event.description}</div>
                  ) : event.type === 'workaround' ? (
                    <div>Added a workaround</div>
                  ) : event.type === 'solution' ? (
                    <div>Added a solution</div>
                  ) : (
                    <div>{event.description}</div>
                  )}
                  
                  {event.comment && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                      {event.comment}
                    </div>
                  )}
                </div>
              </TimelineBody>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
}
