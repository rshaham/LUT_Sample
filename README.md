LUT Implementation in Unity with sample

Assets/LutScripts/LUT_Shader.shader
  - the lut shader itself, takes two texures one is the diffuse and one is the lut
  - uses 4 colors luts to select from based on how the diffuse is masked 
  - diffuse can use standard color if the UVs are on x > 1

Assets/LutScripts/LUT_Material.mat
  - material using the lut shader

Assets/LutScripts/Lut_Selector.cs
  - a base script that uses the shader and can be applied to a prefab to select which lut to use

Assets/Editor/LutTexturesSettings.cs
  - editor image importer script - any texture that has `_lut` in the name will get applied special settings when imported
  - textures need to not be compressed and use clamp 
  
Assets/Prefabs
  - bunch of sample files using the shaders
  
Assets/Scenes/SampleScene.unity
  - sample scene with the prefavs
  
#How to use

Open the top folder in Unity
Open SampleScene.unity
