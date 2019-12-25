Shader "Custom/LUT_Shader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Lut Mask (RGB)", 2D) = "white" {}
        _LutTexture  ("Lut Texture", 2D) = "white" {}
        _LutIndex  ("Lut Index", int) = 1
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200

        CGPROGRAM
        // Physically based Standard lighting model, and enable shadows on all light types
        #pragma surface surf Standard fullforwardshadows

        // Use shader model 3.0 target, to get nicer looking lighting
        #pragma target 3.0

        sampler2D _MainTex;
        sampler2D _LutTexture;

        struct Input
        {
            float2 uv_MainTex;
        };

        half _Glossiness;
        half _Metallic;
        int _LutIndex;
        fixed4 _Color;

        // Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
        // See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
        // #pragma instancing_options assumeuniformscaling
        UNITY_INSTANCING_BUFFER_START(Props)
            // put more per-instance properties here
        UNITY_INSTANCING_BUFFER_END(Props)

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            // Albedo comes from a texture tinted by color
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex);//
            if(IN.uv_MainTex.x <= 1.0)
            {
                float index = 1;
                if(c.r == 1)
                {
                    index += 1;
                }
                if(c.b == 1)
                {
                    index += 2;
                }
                
                float2 lutUV = float2(c.g, 1 - (index / 4));
                fixed4 cLut = tex2D (_LutTexture, lutUV);
                o.Albedo = cLut.rgb * _Color;
            }
            else
            { 
                o.Albedo = c.rgb * _Color;
            }
            
            // Metallic and smoothness come from slider variables
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
