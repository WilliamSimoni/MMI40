package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class BottomNavigationBar extends SubElement {
	
	Props child;//link buttom or text

	public BottomNavigationBar(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		this.child=new Props(IdGenerator.getNextIdProps(), type, false, false,-1);
		this.props.put("child",child);
	}

}
