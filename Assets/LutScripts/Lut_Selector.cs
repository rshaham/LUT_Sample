using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Lut_Selector : MonoBehaviour
{
    private Material prefabMat = null;

    //this is a 1 based indexer - make it simpler to understand when used in the editor
    //just need to decrement it everywhere
    [SerializeField]
    private int _selected = 1;

    [SerializeField]
    public List<Texture2D> _LutTextures = new List<Texture2D>();

    public int _SelectedLut
    {
        get { return _selected; }
        set
        {
            if(value - 1 >= _LutTextures.Count || value < 1)
            {
                _selected = 1;
                Debug.LogError("index out of bound for LUT textures array");
            }
            _selected = value;
            ApplyTexture();
        }
    }

    void ApplyTexture()
    {
        if (prefabMat != null && _LutTextures.Count > 0 && _selected > 0)
        {
            prefabMat.SetTexture("_LutTexture", _LutTextures[_selected - 1]);
        }
    }

    void SetMaterial()
    {
        if(prefabMat == null)
        {
            MeshRenderer renderer = this.GetComponent<MeshRenderer>();
			prefabMat = renderer.material;

		}
    }
    // Start is called before the first frame update
    void Start()
    {
        SetMaterial();
        ApplyTexture();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void OnValidate()
    {
        SetMaterial();
        ApplyTexture();
    }
}
