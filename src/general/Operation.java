package general;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

import net.sourceforge.yamlbeans.YamlException;
import net.sourceforge.yamlbeans.YamlWriter;
import style.StyleValue;

public class Operation {
	
	
	@SuppressWarnings("deprecation")
	public static Style createStyle(String type) {
		String name="visual."+type;
		String value="style."+type+"Style";
		Class<?> classValue=null;
		Class<?> classType = null;
		try {
			classValue = Class.forName(value);
			classType = Class.forName(name);
		} catch (ClassNotFoundException e) {
			
			e.printStackTrace();
			return null;
		}
		try {
			StyleValue k=(StyleValue) classValue.newInstance();
			Style style=new Style(IdGenerator.getNextIdStyle(), classType, k);
		    return style;
		} catch (InstantiationException e) {
			
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			
			e.printStackTrace();
		}
		return null;
		
	}
	
	//crea file diversi per lo stesso style
	public static String exist(String name,int i) {
		String namefile=name+i+".yml";
		String nameout=name+i;
		File fil=new File(namefile);
		if(fil.exists()) {			
			i++;
			nameout=exist(name,i);			
			
		}
		return nameout;
		
	}

	
	public static HashMap<String,Object> ricorsiva(Element el,HashMap<String,Element> map) {
		HashMap<String,Object> root=new HashMap<String,Object>();
		HashMap<String,Object> props=new HashMap<String,Object>();
		
		
		//parte style
		if(el.styleList.size()==1) {
			String nam=el.styleList.get(0).value.getClass().getSimpleName();
			String namefile=nam+".yml";
			String out=nam;
			File fil=new File(namefile);
			if(fil.exists()) {
				out=exist(nam,1);
			}
			out=out+".yml";
			HashMap<String,Object> style=new HashMap<String,Object>();
			style.put(nam, el.styleList.get(0).value);
			try {
				YamlWriter writer=new YamlWriter(new FileWriter(out));
				writer.getConfig().writeConfig.setAutoAnchor(false);
				writer.getConfig().writeConfig.setAlwaysWriteClassname(false);
				 writer.write(style);
		    writer.close();
			} catch (IOException | YamlException e) {
				
				e.printStackTrace();
			}
			props.put("style", out);
			
		} else {	
			if(el.styleList.size()!=0) {
				List<Object> prova=new ArrayList<Object>();
				
				for(int i=0;i<el.styleList.size();i++) {
					String nam=el.styleList.get(i).value.getClass().getSimpleName();
					String namefile=nam+".yml";
					String out=nam;
					File fil=new File(namefile);
					if(fil.exists()) {
						out=exist(nam,1);
					}
					out=out+".yml";
					HashMap<String,Object> style=new HashMap<String,Object>();
					style.put(nam, el.styleList.get(i).value);
					prova.add(style);
					
				}
				String nn=el.getClass().getSimpleName()+"Style.yml";
				try {
					YamlWriter writer=new YamlWriter(new FileWriter(nn));
					writer.getConfig().writeConfig.setAutoAnchor(false);
					writer.getConfig().writeConfig.setAlwaysWriteClassname(false);
					for(Object p: prova) {
						writer.write(p);
					}
					 
			    writer.close();
				} catch (IOException | YamlException e) {
					
					e.printStackTrace();
				}
				
				props.put("style", nn);
			}
			
		}
		///////////////////////////
		//parte props
		String name=el.getClass().getSimpleName();
		Set<String> key=el.props.keySet();
		
		for(String s:key) {
			Props p=el.props.get(s);
			if(p.value.size()==0) continue;
			if(p.value.size()==1) {
				String single=(String) p.value.get(0);
				char a=single.charAt(0);
				if(a!='E' && a!='P' && a!='S') {
					props.put(s, single);
				    continue;
				}
				
			}
			List<Object> value=new ArrayList<Object>();
			
			for(int i=0;i<p.value.size();i++) {
				String io=(String) p.value.get(i);
				char a=io.charAt(0);
				if(a=='E' || a=='P' || a=='S') {
					Element z=map.get(io);
					HashMap<String,Object> ric=ricorsiva(z,map);
					value.add(ric);
					
				} else {
					value.add(io);
				}
			}
			props.put(s, value);
			
		}
		root.put(name, props);
		return root;
		
	}
	


}
