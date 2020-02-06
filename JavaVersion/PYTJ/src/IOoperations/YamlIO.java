package IOoperations;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;

import net.sourceforge.yamlbeans.YamlException;
import net.sourceforge.yamlbeans.YamlReader;
import net.sourceforge.yamlbeans.YamlWriter;

public class YamlIO {
	
	//REQUIRE: fileName != null
	//RETURNS: if fileName exists, returns the Map which represent the the file content. If something go wrong, returns null
	@SuppressWarnings("unchecked")
	
	public static Map<String,Object> read (String fileName) {
		try {
			YamlReader reader = new YamlReader(new FileReader(fileName));
			Object object = (Map<String, String>) reader.read();
			reader.close();
			return (Map<String, Object>) object;
		} catch (YamlException | IOException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	//REQUIRE: fileName != null && output != null
	//EFFECTS: writes the output Map in a file named fileName.
	public static void write (String fileName, Map<String,String> output) {
		try {
			YamlWriter writer = new YamlWriter(new FileWriter(fileName));
			writer.write(output);
			writer.close();
		} catch (YamlException | IOException e) {
			e.printStackTrace();
		}
	}
}
	
