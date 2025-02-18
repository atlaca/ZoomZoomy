import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { GripVertical, X, Plus } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  times: number[];
  currentTime: number | null;
  completed: boolean;
}

const SetupPage = ({ 
  tasks, 
  setTasks, 
  projectName, 
  setProjectName, 
  processName, 
  setProcessName, 
  onStartTiming 
}: {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  processName: string;
  setProcessName: (name: string) => void;
  onStartTiming: () => void;
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [draggedTask, setDraggedTask] = useState(null as Task | null);
  const [draggedOverTask, setDraggedOverTask] = useState(null as Task | null);

  const handleAddTask = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          name: newTaskName.trim(),
          times: [],
          currentTime: null,
          completed: false
        }
      ]);
      setNewTaskName('');
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: { preventDefault: () => void }, task: Task) => {
    e.preventDefault();
    setDraggedOverTask(task);
  };

  const handleDrop = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!draggedTask || !draggedOverTask) return;

    const tasksCopy = [...tasks];
    const draggedIndex = tasksCopy.findIndex(task => task.id === draggedTask.id);
    const droppedIndex = tasksCopy.findIndex(task => task.id === draggedOverTask.id);

    tasksCopy.splice(draggedIndex, 1);
    tasksCopy.splice(droppedIndex, 0, draggedTask);

    setTasks(tasksCopy);
    setDraggedTask(null);
    setDraggedOverTask(null);
  };

  return (
    <div className="p-4 min-h-screen bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Process Setup</h1>
        {tasks.length > 0 && (
          <button
            onClick={onStartTiming}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            START TIMING
          </button>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">PROJECT NAME:</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block mb-2">PROCESS NAME:</label>
          <input
            type="text"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
      </div>

      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Enter new task"
            className="flex-1 p-2 rounded bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="bg-green-500 p-2 rounded"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task)}
            onDragOver={(e) => handleDragOver(e, task)}
            onDrop={handleDrop}
            className={`flex items-center justify-between p-3 rounded border border-gray-700 ${
              draggedOverTask?.id === task.id ? 'border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="cursor-move text-gray-500" size={20} />
              <span>{task.name}</span>
            </div>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-500 p-1"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimingPage = ({ 
  tasks, 
  setTasks, 
  projectName, 
  processName 
}: {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projectName: string;
  processName: string;
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [processComplete, setProcessComplete] = useState(false);
  const [lastCycleEndTime, setLastCycleEndTime] = useState(0);
  const [cycleTimes, setCycleTimes] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startProcess = () => {
    setIsRunning(true);
    setProcessComplete(false);
    setTasks(tasks.map(task => ({
      ...task,
      completed: false,
      currentTime: null
    })));
    setElapsedTime(0);
      setLastCycleEndTime(0);
      setCycleTimes([]);
  };

  const completeTask = (taskId: number) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    const previousTime = taskIndex > 0 ? 
      tasks[taskIndex - 1].currentTime || 0 : 
      lastCycleEndTime;
    
    const cycleTime = elapsedTime - previousTime;

    const updatedTask = {
      ...tasks[taskIndex],
      completed: true,
      currentTime: elapsedTime,
      times: [...tasks[taskIndex].times, cycleTime]
    };

    const updatedTasks = [
      ...tasks.slice(0, taskIndex),
      updatedTask,
      ...tasks.slice(taskIndex + 1)
    ];

    setTasks(updatedTasks);

    if (taskIndex === tasks.length - 1) {
      const cycleTime = elapsedTime - lastCycleEndTime;
      setLastCycleEndTime(elapsedTime);
      setCycleTimes(prev => [...prev, cycleTime]);
      Promise.resolve().then(() => {
        setTimeout(() => {
          setTasks(updatedTasks.map(task => ({
            ...task,
            completed: false,
            currentTime: null
          })));
        }, 100);
      });
    }
  };

  const resetForNextCycle = () => {
    setTasks(tasks.map(task => ({
      ...task,
      completed: false,
      currentTime: null
    })));
  };

  const endProcess = () => {
    setIsRunning(false);
    setProcessComplete(true);
  };

  const calculateStats = (times: number[]) => {
    if (times.length === 0) return { n: 0, xbar: 0, min: 0, max: 0 };
    return {
      n: times.length,
      xbar: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  };

  const getChartData = () => {
    return cycleTimes.map((time, index) => ({
      name: `Cycle ${index + 1}`,
      time: time
    }));
  };

  return (
    <div className="p-4 min-h-screen bg-black text-white">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{projectName}</h1>
        <h2 className="text-lg text-gray-400">{processName}</h2>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="text-4xl mb-12">
          {elapsedTime.toFixed(1)}s
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={startProcess}
            className="bg-blue-500 px-6 py-3 rounded"
            disabled={isRunning}
          >
            START PROCESS
          </button>
          <button
            onClick={endProcess}
            className="bg-red-500 px-6 py-3 rounded"
            disabled={!isRunning}
          >
            PROCESS COMPLETE
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex justify-between items-center p-2 border border-gray-700 rounded">
            <span>{task.name}</span>
            {task.completed ? (
              <div className="bg-yellow-900 px-4 py-2 rounded text-white">
                {task.times[task.times.length - 1].toFixed(1)}s
              </div>
            ) : (
              <button
                onClick={() => completeTask(task.id)}
                className="bg-green-500 px-4 py-2 rounded"
                disabled={!isRunning}
              >
                COMPLETE
              </button>
            )}
          </div>
        ))}
      </div>

      {processComplete && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Task</th>
                  <th className="p-2">n</th>
                  <th className="p-2">Xbar</th>
                  <th className="p-2">MIN</th>
                  <th className="p-2">MAX</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const stats = calculateStats(task.times);
                  return (
                    <tr key={task.id} className="border-b border-gray-700">
                      <td className="p-2">{task.name}</td>
                      <td className="text-center p-2">{stats.n}</td>
                      <td className="text-center p-2">{stats.xbar.toFixed(1)}s</td>
                      <td className="text-center p-2">{stats.min.toFixed(1)}s</td>
                      <td className="text-center p-2">{stats.max.toFixed(1)}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Cycle Time Analysis</h2>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()} 
                  layout="vertical" 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    label={{ 
                      value: 'Total Cycle Time (s)', 
                      position: 'bottom',
                      style: { fill: 'white' }
                    }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    style={{ fill: 'white' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333'
                    }}
                    labelStyle={{ color: 'white' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Bar 
                    dataKey="time" 
                    name="Cycle Time (s)"
                    fill="#FFD700"
                    label={{
                      position: 'center',
                      fill: '#000',
                      formatter: (value: number) => `${value.toFixed(1)}s`,
                      offset: 10
                    }}
                    onMouseOver={(data, index) => {
                      document.querySelector(`[datakey="time"][index="${index}"]`)?.setAttribute('fill', '#FFA500');
                    }}
                    onMouseOut={(data, index) => {
                      document.querySelector(`[datakey="time"][index="${index}"]`)?.setAttribute('fill', '#FFD700');
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ZoomZoomyDemo = () => {
  const [tasks, setTasks] = useState([] as Task[]);
  const [projectName, setProjectName] = useState('');
  const [processName, setProcessName] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  return isSetupComplete ? (
    <TimingPage
      tasks={tasks}
      setTasks={setTasks}
      projectName={projectName}
      processName={processName}
    />
  ) : (
    <SetupPage
      tasks={tasks}
      setTasks={setTasks}
      projectName={projectName}
      setProjectName={setProjectName}
      processName={processName}
      setProcessName={setProcessName}
      onStartTiming={() => setIsSetupComplete(true)}
    />
  );
};

export default ZoomZoomyDemo;
