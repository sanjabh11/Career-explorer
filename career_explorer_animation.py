import bpy
import math
import random

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Set up the scene
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 300

# Create a world with a blue gradient background
world = bpy.data.worlds['World']
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.05, 0.1, 0.2, 1.0)
bg.inputs[1].default_value = 1.0

# Add a camera
bpy.ops.object.camera_add(location=(0, -10, 5), rotation=(math.radians(70), 0, 0))
camera = bpy.context.object
scene.camera = camera

# Add animation to camera
camera.keyframe_insert(data_path="location", frame=1)
camera.location = (0, -8, 6)
camera.keyframe_insert(data_path="location", frame=300)

# Create materials
def create_material(name, color):
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    material.node_tree.nodes["Principled BSDF"].inputs[0].default_value = color
    material.node_tree.nodes["Principled BSDF"].inputs[7].default_value = 0.2  # Metallic
    material.node_tree.nodes["Principled BSDF"].inputs[9].default_value = 0.8  # Roughness
    return material

# Create materials for each component
job_req_material = create_material("JobRequirements", (0.0, 0.5, 1.0, 1.0))  # Blue
career_path_material = create_material("CareerPathways", (0.0, 0.8, 0.4, 1.0))  # Green
work_context_material = create_material("WorkContext", (0.8, 0.4, 0.0, 1.0))  # Orange
automation_material = create_material("AutomationImpact", (0.8, 0.0, 0.4, 1.0))  # Pink
base_material = create_material("Base", (0.2, 0.2, 0.2, 1.0))  # Dark gray

# Create a base platform
bpy.ops.mesh.primitive_cylinder_add(radius=5, depth=0.2, location=(0, 0, -0.1))
base = bpy.context.object
base.name = "Platform"
base.data.materials.append(base_material)

# Create a central pillar
bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=4, location=(0, 0, 2))
pillar = bpy.context.object
pillar.name = "CentralPillar"
pillar.data.materials.append(base_material)

# Function to create component objects
def create_component(name, material, start_angle, size=1.0, height=2.0):
    # Create the main component cube
    bpy.ops.mesh.primitive_cube_add(size=size, location=(
        3 * math.cos(start_angle), 
        3 * math.sin(start_angle), 
        height
    ))
    component = bpy.context.object
    component.name = name
    component.data.materials.append(material)
    
    # Create a connecting arm to the central pillar
    bpy.ops.mesh.primitive_cube_add(
        size=0.2,
        location=(
            1.5 * math.cos(start_angle), 
            1.5 * math.sin(start_angle), 
            height
        )
    )
    arm = bpy.context.object
    arm.name = f"{name}_Arm"
    arm.scale.x = 3.0 * abs(math.cos(start_angle))
    arm.scale.y = 3.0 * abs(math.sin(start_angle))
    arm.data.materials.append(material)
    
    # Add animation to the component
    component.keyframe_insert(data_path="location", frame=1)
    component.location.z += 2
    component.keyframe_insert(data_path="location", frame=30 + 20 * start_angle)
    component.keyframe_insert(data_path="rotation_euler", frame=1)
    component.rotation_euler = (0, 0, start_angle + math.pi * 2)
    component.keyframe_insert(data_path="rotation_euler", frame=300)
    
    # Create sub-components (representing features)
    for i in range(3):
        sub_angle = start_angle + (i - 1) * 0.3
        distance = 3.8 + 0.3 * i
        bpy.ops.mesh.primitive_cube_add(
            size=0.4,
            location=(
                distance * math.cos(sub_angle), 
                distance * math.sin(sub_angle), 
                height + 0.3 * (i - 1)
            )
        )
        sub = bpy.context.object
        sub.name = f"{name}_Sub_{i}"
        sub.data.materials.append(material)
        
        # Add animation to sub-components
        sub.keyframe_insert(data_path="location", frame=1)
        sub.location.z += 4
        sub.keyframe_insert(data_path="location", frame=60 + 15 * i + 20 * start_angle)
        
        # Connect sub-components to main component
        bpy.ops.mesh.primitive_cube_add(
            size=0.1,
            location=(
                (distance - 0.4) * math.cos(sub_angle) + 0.2 * math.cos(start_angle), 
                (distance - 0.4) * math.sin(sub_angle) + 0.2 * math.sin(start_angle), 
                height + 0.3 * (i - 1)
            )
        )
        sub_arm = bpy.context.object
        sub_arm.name = f"{name}_Sub_{i}_Arm"
        sub_arm.scale.x = 0.8
        sub_arm.scale.y = 0.8
        sub_arm.data.materials.append(material)
        
        # Add animation to sub-component arms
        sub_arm.keyframe_insert(data_path="location", frame=1)
        sub_arm.location.z += 4
        sub_arm.keyframe_insert(data_path="location", frame=60 + 15 * i + 20 * start_angle)
    
    return component

# Create the four main components
job_req = create_component("JobRequirements", job_req_material, 0, size=1.2, height=2.0)
career_path = create_component("CareerPathways", career_path_material, math.pi/2, size=1.2, height=2.0)
work_context = create_component("WorkContext", work_context_material, math.pi, size=1.2, height=2.0)
automation = create_component("AutomationImpact", automation_material, 3*math.pi/2, size=1.2, height=2.0)

# Add text objects for labels
def add_text(text, location, material):
    bpy.ops.object.text_add(location=location)
    text_obj = bpy.context.object
    text_obj.data.body = text
    text_obj.data.size = 0.4
    text_obj.data.extrude = 0.05
    text_obj.data.materials.append(material)
    
    # Add animation
    text_obj.keyframe_insert(data_path="location", frame=1)
    text_obj.location.z += 5
    text_obj.keyframe_insert(data_path="location", frame=90)
    
    return text_obj

# Add labels for each component
job_req_text = add_text("Job Requirements", (2, -1, 3.5), job_req_material)
career_path_text = add_text("Career Pathways", (-1, 2, 3.5), career_path_material)
work_context_text = add_text("Work Context", (-2, -1, 3.5), work_context_material)
automation_text = add_text("Automation Impact", (-1, -2, 3.5), automation_material)

# Add main title
title = add_text("Career Explorer", (0, 0, 5), base_material)
title.data.size = 0.8
title.data.align_x = 'CENTER'

# Add particles for visual effect
def add_particles(obj):
    particles = obj.modifiers.new("Particles", 'PARTICLE_SYSTEM')
    particles_settings = obj.particle_systems[0].settings
    particles_settings.count = 100
    particles_settings.lifetime = 50
    particles_settings.emit_from = 'VERT'
    particles_settings.physics_type = 'NEWTON'
    particles_settings.particle_size = 0.05
    particles_settings.render_type = 'SPHERE'
    particles_settings.frame_start = 1
    particles_settings.frame_end = 20
    particles_settings.normal_factor = 0.2
    
    # Create material for particles
    particle_mat = create_material(f"{obj.name}_particles", (1, 1, 1, 1))
    particle_mat.node_tree.nodes["Principled BSDF"].inputs[19].default_value = 2.0  # Emission strength
    
    # Assign material to particles
    particles_settings.material = len(bpy.data.materials) - 1

# Add particles to components
add_particles(job_req)
add_particles(career_path)
add_particles(work_context)
add_particles(automation)

# Add lights
def add_light(location, energy=1000, color=(1, 1, 1)):
    bpy.ops.object.light_add(type='POINT', location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.color = color
    return light

# Add lights
add_light((5, 5, 10), energy=1000, color=(1, 0.9, 0.8))
add_light((-5, -5, 10), energy=800, color=(0.8, 0.9, 1))
add_light((0, 0, -2), energy=500, color=(0.2, 0.3, 0.8))

# Add animation to all objects for a final rotation
for obj in bpy.data.objects:
    if obj.type == 'MESH' or obj.type == 'FONT':
        obj.keyframe_insert(data_path="rotation_euler", frame=200)
        obj.rotation_euler.z += math.pi * 2
        obj.keyframe_insert(data_path="rotation_euler", frame=300)

# Set up render settings
scene.render.filepath = "//career_explorer_animation_"
scene.render.image_settings.file_format = 'PNG'

print("Career Explorer 3D animation setup complete!")
