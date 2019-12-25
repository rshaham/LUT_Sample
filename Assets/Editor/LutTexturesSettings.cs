using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;

public class LutTexturesSettings : AssetPostprocessor
{


    void OnPreprocessTexture()
    {
        TextureImporter importer = (TextureImporter)assetImporter;

        if (importer.assetPath.Contains("_lut"))
        {
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.filterMode = FilterMode.Point;
            importer.wrapMode = TextureWrapMode.Clamp;
            Debug.Log(importer.assetPath + "     Settings changed");
        }
    }
}
