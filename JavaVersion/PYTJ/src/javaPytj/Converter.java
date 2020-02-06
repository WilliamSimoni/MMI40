package javaPytj;

import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import IOoperations.YamlIO;

public class Converter {
	
	JSONObject root;
	String directoryRoot;
	
	public Converter() {
		root = new JSONObject();
	}
	
	@SuppressWarnings("unchecked")
	public JSONObject convert(String filePath) {
		return ConvertFile(filePath);
	}
	
	private JSONObject ConvertFile(String filePath) {
		Map<String,Object> yaml = YamlIO.read(filePath);
		if (yaml != null) {
			return surfMap(yaml, this.getDirectoryFile(filePath));
		} else {
			return null;
		}
	}
	
	//there can be two types of structures in the yaml file, an Array or a Map. 
	//So the code handles these cases separately
	
	//this method handles map structures
	@SuppressWarnings("unchecked")
	private JSONObject surfMap(Map<String,Object> yaml, String directory) {
		if (yaml == null || directory == null)
				return null;
		
		JSONObject objMap = new JSONObject();
		yaml.forEach((k,v) -> {
			if (v instanceof Map) {
				objMap.put(k, surfMap((Map<String,Object>)v, directory));
			} else if (v instanceof List) {
				objMap.put(k, surfArray((List<Object>)v, directory));
				} else {
					//If v is neither a Map or a List, then v is a String
					String value = (String) v;
					//if value ends with .yaml, then is a reference to another file
					if (value.endsWith(".yaml"))
						objMap.put(k, handleCreateFile((String) k, value, directory));
					else
						objMap.put(k, v);
				}
		}); 
		return objMap;
	}
	
	//this method handles array structures
	@SuppressWarnings("unchecked")
	private JSONArray surfArray(List<Object> yaml, String directory) {
		JSONArray objArray = new JSONArray();
		yaml.forEach((v) -> {
			if (v instanceof Map) {
				objArray.add(surfMap((Map<String,Object>)v, directory));
			} else if (v instanceof List) {
				objArray.add(surfArray((List<Object>)v, directory));
				} else {
					objArray.add(v);
				}
		});
		return objArray;
	}
	
	//called when the program needs to search in other files
	private JSONObject handleCreateFile(String key, String value, String directory){
		if (key == null || value == null || directory == null)
			return null;
		if (key.equals("style")) {
			return ConvertFile(directory + "\\style\\" + value);
		} else {
			return ConvertFile(directory + "\\" + value);
		}
	}
	
	// Only for Windows Systems
	private String getDirectoryFile(String filePath) {
		
		int lastindex = filePath.lastIndexOf("\\");
		
		if (lastindex == -1) {
			System.out.println("unable to get directory path");
			return null;
		} else {
			return filePath.substring(0,lastindex);
		}
		
	}
	
}
