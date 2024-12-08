# Skills Development Framework Implementation Guide

## Overview
This guide documents the implementation of the Skills Development Framework, including component structure, API endpoints, and configuration details.

## Component Structure

### 1. Core Components
- `SkillsDevelopment.tsx`: Main component for skills visualization and management
- `AssessmentContainer.tsx`: Handles skill assessments
- `SkillProgression.tsx`: Displays skill progression and learning paths

### 2. Services
- `SkillsService.ts`: API integration for skills management
- `OnetService.js`: Integration with O*NET database

## Database Models

### SQLAlchemy Models
```python
class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    category = Column(String(100))
    description = Column(String(1000))
    proficiency_levels = Column(JSON)
    learning_resources = Column(JSON)
    assessment_criteria = Column(JSON)
    industry_demand = Column(Float)
    future_relevance = Column(Float)
    automation_resistance = Column(Float)

class SkillAssessment(Base):
    __tablename__ = 'skill_assessments'
    id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    current_level = Column(Integer)
```

## API Endpoints

### Skills API
```python
@router.get("/api/v2/skills/{role_id}")
@router.get("/api/v2/skills/assessment/{user_id}/{skill_id}")
@router.post("/api/v2/skills/assessment")
@router.get("/api/v2/skills/gap-analysis/{user_id}/{role_id}")
@router.get("/api/v2/skills/metrics/{skill_id}")
@router.get("/api/v2/skills/learning-path/{user_id}/{role_id}")
```

## Configuration

### Netlify Development Setup
```toml
[dev]
  command = "npm start"
  port = 3001
  targetPort = 3000
  publish = "build"
  framework = "#custom"
  autoLaunch = true
```

### API Configuration
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/.netlify/functions'
  : 'http://localhost:3001/.netlify/functions';
```

## TypeScript Interfaces

```typescript
interface SkillsDevelopmentProps {
    roleId: number;
    userId: number;
}

interface Skill {
    id: number;
    name: string;
    category: string;
    current_level: number;
    required_level: number;
    learning_resources: any[];
}

interface LearningPath {
    skill_id: number;
    name: string;
    current_level: number;
    target_level: number;
    prerequisites: Array<{
        skill_id: number;
        name: string;
        estimated_time: number;
    }>;
    learning_resources: any[];
    estimated_time: number;
    milestones: Array<{
        level: number;
        description: string;
        assessment_criteria: string[];
    }>;
}
```

## Features
1. Skill Gap Analysis
2. Learning Path Generation
3. Progress Tracking
4. Interactive Visualizations
5. Resource Recommendations
6. Prerequisite Mapping
7. Milestone Tracking

## Development Notes

### Port Configuration
- React App: Port 3000
- Netlify Dev Proxy: Port 3001
- Netlify Functions: Accessed through Port 3001

### Important Considerations
1. Always use different values for `port` and `targetPort` in Netlify configuration
2. Update API_BASE_URL in config.js to match Netlify Dev port
3. Ensure proper CORS configuration for local development
4. Handle loading states and error boundaries in components
5. Implement proper type checking for all interfaces

### Troubleshooting
1. Port Conflicts:
   - Check for processes using required ports
   - Use `netstat -ano | findstr :[PORT]` to identify processes
   - Kill conflicting processes if necessary

2. API Connection Issues:
   - Verify Netlify Functions are running
   - Check API_BASE_URL configuration
   - Ensure CORS headers are properly set

## Future Enhancements
1. Machine Learning Integration
2. Advanced Analytics Dashboard
3. Personalized Learning Recommendations
4. External Learning Platform Integration
5. Real-time Collaboration Features
