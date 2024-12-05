import React from 'react';
import { Card } from './common/Card';
import WorkEnvironmentAnalysis from './enhanced/work-environment/WorkEnvironmentAnalysis';
import EducationRequirements from './enhanced/education/EducationRequirements';
import SkillsDevelopment from './enhanced/skills/SkillsDevelopment';

interface DashboardProps {
    roleId: number;
    userId: number;
}

const Dashboard: React.FC<DashboardProps> = ({ roleId, userId }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Card */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Career Path Overview</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Work Environment Compatibility</span>
                            <span className="font-semibold">85%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Education Progress</span>
                            <span className="font-semibold">70%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Skills Match</span>
                            <span className="font-semibold">75%</span>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions Card */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 text-left bg-indigo-50 rounded-lg hover:bg-indigo-100">
                            <h3 className="font-semibold text-indigo-700">Update Skills</h3>
                            <p className="text-sm text-gray-600">Track your progress</p>
                        </button>
                        <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100">
                            <h3 className="font-semibold text-green-700">Set Goals</h3>
                            <p className="text-sm text-gray-600">Plan your career</p>
                        </button>
                        <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100">
                            <h3 className="font-semibold text-purple-700">View Metrics</h3>
                            <p className="text-sm text-gray-600">Check performance</p>
                        </button>
                        <button className="p-4 text-left bg-yellow-50 rounded-lg hover:bg-yellow-100">
                            <h3 className="font-semibold text-yellow-700">Get Help</h3>
                            <p className="text-sm text-gray-600">Find resources</p>
                        </button>
                    </div>
                </Card>
            </div>

            {/* Skills Development */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Skills Development</h2>
                <SkillsDevelopment roleId={roleId} userId={userId} />
            </section>

            {/* Work Environment Analysis */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Work Environment Analysis</h2>
                <WorkEnvironmentAnalysis roleId={roleId} userId={userId} />
            </section>

            {/* Education Requirements */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Education Requirements</h2>
                <EducationRequirements roleId={roleId} />
            </section>
        </div>
    );
};

export default Dashboard;
