import React from 'react';
import styles from '../styles/JobTaxonomySelector.module.css';

interface TaskTransformationProps {
  tasks: any[];
}

const TaskTransformationAnalysis: React.FC<TaskTransformationProps> = ({ tasks }) => {
  return (
    <div className={styles.taskTransformationAnalysis}>
      <h3 className="text-lg font-semibold mb-4">Task Transformation Analysis</h3>
      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={index} className={styles.taskItem}>
            <div className={styles.taskName}>{task.name}</div>
            <div className={styles.taskDescription}>{task.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskTransformationAnalysis;
