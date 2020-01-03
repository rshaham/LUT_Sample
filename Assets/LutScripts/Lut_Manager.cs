using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class Lut_Manager : MonoBehaviour, IEnumerable<Lut_Selector>
{
    private List<Lut_Selector> LutList = new List<Lut_Selector>();

    void AutoSceneLutPopulate()
    {
        //Scene scene = SceneManager.GetActiveScene();

        LutList.AddRange(FindObjectsOfType<Lut_Selector>());
        if(LutList.Count == 0)
        {
            Debug.Log("No lut objects in the scene");
        }

    }

    public bool AddLut(GameObject add)
    {
        Lut_Selector lut = add.GetComponent<Lut_Selector>();
        if (lut != null)
        {
            LutList.Add(lut);

            return true;
        }

        Debug.Log("object is not a lut object");
        return false;
    }

    public int LutCount()
    {
        return LutList.Count;
    }

    public Lut_Selector GetLut(int index)
    {
        if (index >= LutList.Count )
        {
            Debug.LogError("index out of bound for LUT textures array");
            return null;
        }
        return LutList[index];
    }

    // Start is called before the first frame update
    void Start()
    {
        AutoSceneLutPopulate();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public IEnumerator<Lut_Selector> GetEnumerator()
    {
        return ((IEnumerable<Lut_Selector>)LutList).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return ((IEnumerable<Lut_Selector>)LutList).GetEnumerator();
    }
}
