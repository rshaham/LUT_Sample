using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class SampleSceneScript : MonoBehaviour
{

    public float speed = 1f;
    public float speedH = 50.0f;
    public float speedV = 50.0f;

    private float yaw = 0.0f;
    private float pitch = 0.0f;
    // Update is called once per frame
    private Vector3 lastMouse;
    float camSens = 0.25f;

    Lut_Manager lutManager = null;
    // Start is called before the first frame update
    void Start()
    {
        lastMouse = Input.mousePosition;
        lutManager = GetComponent<Lut_Manager>();
        Debug.Assert(lutManager != null, "Cannot find component Lut Manager, please add to object");
    }

    void CycleLuts()
    {
     
        foreach(Lut_Selector lut in lutManager)
        {
           lut._Selected = ((lut._Selected + 1) % lut._LutTextures.Count);
        }
    }

    void Update()
    {

        lastMouse = Input.mousePosition - lastMouse;
        lastMouse = new Vector3(-lastMouse.y * camSens, lastMouse.x * camSens, 0);
        lastMouse = new Vector3(transform.eulerAngles.x + lastMouse.x, transform.eulerAngles.y + lastMouse.y, 0);
        transform.eulerAngles = lastMouse;
        lastMouse = Input.mousePosition;

        Vector3 pos = Vector3.zero;

        if (Input.GetKey("w"))
        {
            pos.z += speed * Time.deltaTime;
        }
        if (Input.GetKey("s"))
        {
            pos.z -= speed * Time.deltaTime;
        }
        if (Input.GetKey("d"))
        {
            pos.x += speed * Time.deltaTime;
        }
        if (Input.GetKey("a"))
        {
            pos.x -= speed * Time.deltaTime;
        }

        bool isLeftButtonDown = Input.GetMouseButtonDown(0);

        if(isLeftButtonDown)
        {
            CycleLuts();
        }
        //bool isRightButtonDown = Input.GetMouseButtonDown(1);
        //bool isMiddleButtonDown = Input.GetMouseButtonDown(2);


        transform.Translate(pos);
    }
}
