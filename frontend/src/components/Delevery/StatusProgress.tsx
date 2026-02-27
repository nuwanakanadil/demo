import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import { Card } from './ui/Card';
type LogisticsStatus = 'PENDING' | 'SCHEDULED' | 'IN_TRANSIT' | 'DONE';
interface StatusProgressProps {
  currentStatus: LogisticsStatus;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
const statusSteps = [
{
  key: 'PENDING',
  label: 'Pending',
  color: 'amber'
},
{
  key: 'SCHEDULED',
  label: 'Scheduled',
  color: 'green'
},
{
  key: 'IN_TRANSIT',
  label: 'In Transit',
  color: 'purple'
},
{
  key: 'DONE',
  label: 'Completed',
  color: 'green'
}] as
const;
type StepColor = 'amber' | 'green' | 'purple' | 'gray';
export function StatusProgress({
  currentStatus,
  lastUpdatedBy,
  lastUpdatedAt
}: StatusProgressProps) {
  const currentIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );
  const getStepColor = (index: number, color: StepColor): StepColor => {
    if (index < currentIndex) return 'green';
    if (index === currentIndex) return color;
    return 'gray';
  };
  const colorClasses = {
    amber: 'bg-amber-500 border-amber-400',
    green: 'bg-green-500 border-green-400',
    purple: 'bg-purple-500 border-purple-400',
    gray: 'bg-gray-300 border-gray-400'
  };
  return (
    <Card>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Progress</h3>

      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const stepColor = getStepColor(index, step.color);
          return (
            <motion.div
              key={step.key}
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: index * 0.1
              }}
              className="flex items-center space-x-4">

              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${colorClasses[stepColor]} ${isActive ? 'ring-4 ring-offset-2 ring-offset-white' : ''}`}>

                  {isCompleted ?
                  <CheckIcon className="h-5 w-5 text-white" /> :

                  <span className="text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                  }
                </div>

                {index < statusSteps.length - 1 &&
                <div
                  className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />

                }
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>

                  {step.label}
                </p>
                {isActive &&
                <p className="text-sm text-gray-500 mt-0.5">Current stage</p>
                }
              </div>
            </motion.div>);

        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Last updated by:</span>
            <span className="text-gray-900 font-medium">@{lastUpdatedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last updated:</span>
            <span className="text-gray-900 font-medium">{lastUpdatedAt}</span>
          </div>
        </div>
      </div>
    </Card>);

}
