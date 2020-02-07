package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Text extends SubElement {
	
	Props text;

	public Text(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		
		this.text=new Props(IdGenerator.getNextIdProps(), type, true, true,1);
		this.props.put("text",text);
	}

}
