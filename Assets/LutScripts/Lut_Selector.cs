using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Lut_Selector : MonoBehaviour
{
    private Material prefabMat = null;

    //this is a 1 based indexer - make it simpler to understand when used in the editor
    //just need to decrement it everywhere
    [SerializeField]
    private int _EditorSelected = 1;

    [SerializeField]
    public List<Texture2D> _LutTextures = new List<Texture2D>();


    private int _selected = 0;
    public int _Selected
    {
        get { return _selected; }
        set
        {
            if(value >= _LutTextures.Count || value < 0)
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
        if (prefabMat != null && _LutTextures.Count > 0 && _selected < _LutTextures.Count) 
        {
            prefabMat.SetTexture("_LutTexture", _LutTextures[_selected]);
        }
    }

    void SetMaterial()
    {
        if(prefabMat == null)
        {
            MeshRenderer mr = this.GetComponent<MeshRenderer>();
			prefabMat = mr.material;

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
        _selected = _EditorSelected - 1;
        ApplyTexture();
    }
}
